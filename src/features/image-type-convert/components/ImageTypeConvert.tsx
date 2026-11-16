"use client";

import { Button, Card, CardBody, Progress } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowLeft,
  HiOutlineCloudUpload,
  HiOutlineDownload,
  HiOutlineFolderOpen,
  HiOutlinePhotograph,
  HiOutlineShieldCheck,
  HiOutlineSwitchHorizontal,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  FORMATS,
  FORMAT_EXTENSIONS,
  IMAGE_ACCEPT,
  LOSSY_FORMATS,
  MAX_BATCH_BYTES,
  QUALITY_OPTIONS,
} from "@/features/image-type-convert/constants";
import { appendFiles } from "@/features/image-type-convert/lib/append-files";
import {
  buildZip,
  uniqueOutputName,
} from "@/features/image-type-convert/lib/archive";
import {
  outputName,
  validateFile,
} from "@/features/image-type-convert/lib/convert";
import { convertFile } from "@/features/image-type-convert/lib/convert-file";
import {
  collectFolderImages,
  folderSelection,
} from "@/features/image-type-convert/lib/folders";
import type {
  BatchItem,
  ConversionError,
  ConverterSettings,
  SelectedImage,
} from "@/features/image-type-convert/model/converter";
import FormHookWrapper from "@/shared/ui/form/FormHookWrapper";
import InputSelect from "@/shared/ui/inputs/InputSelect";

export interface ImageTypeConvertProps {
  className?: string;
}
const ImageTypeConvert: React.FC<ImageTypeConvertProps> = ({
  className = "",
}) => {
  const { t } = useTranslation();
  const [items, setItemState] = useState<BatchItem[]>([]);
  const itemsRef = useRef<BatchItem[]>([]);
  const setItems = (update: React.SetStateAction<BatchItem[]>) => {
    const next =
      typeof update === "function" ? update(itemsRef.current) : update;
    itemsRef.current = next;
    setItemState(next);
  };
  const [error, setError] = useState<ConversionError | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [packing, setPacking] = useState(false);
  const [archiveUrl, setArchiveUrl] = useState<string | null>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const ownedUrls = useRef(new Set<string>());
  const scans = useRef(new Set<AbortController>());
  const archiveVersion = useRef(0);
  const archiveRef = useRef<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const urls = ownedUrls.current;
    const pendingScans = scans.current;
    return () => {
      generation.current += 1;
      controller.current?.abort();
      archiveVersion.current += 1;
      pendingScans.forEach((scan) => scan.abort());
      pendingScans.clear();
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);
  const invalidateArchive = () => {
    archiveVersion.current += 1;
    if (archiveRef.current) {
      URL.revokeObjectURL(archiveRef.current);
      ownedUrls.current.delete(archiveRef.current);
    }
    archiveRef.current = null;
    setArchiveUrl(null);
    setPacking(false);
  };
  const clearResources = () => {
    generation.current += 1;
    controller.current?.abort();
    scans.current.forEach((scan) => scan.abort());
    scans.current.clear();
    invalidateArchive();
    ownedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    ownedUrls.current.clear();
    setScanning(false);
    setArchiveUrl(null);
    setPacking(false);
    setBusy(false);
    setError(null);
  };
  const reset = () => {
    clearResources();
    setItems([]);
    if (input.current) input.current.value = "";
    if (folderInput.current) folderInput.current.value = "";
  };
  const installFiles = (files: SelectedImage[]) => {
    if (!files.length) {
      setError("noImages");
      return;
    }
    setError(null);
    try {
      const next = appendFiles(itemsRef.current, files);
      if (next !== itemsRef.current) {
        invalidateArchive();
        setItems(next);
      }
    } catch {
      setError("batchLimit");
    }
  };

  const selectFiles = (files: File[], folder = false) => {
    if (!files.length) return;
    if (input.current) input.current.value = "";
    if (folderInput.current) folderInput.current.value = "";
    installFiles(
      folder
        ? folderSelection(files)
        : files.map((file) => ({ file, path: file.name })),
    );
  };
  const importDrop = async (entries: FileSystemEntry[], files: File[]) => {
    setError(null);
    const token = generation.current;
    const abort = new AbortController();
    scans.current.add(abort);
    setScanning(true);
    try {
      const found = await collectFolderImages(entries, abort.signal);
      if (token !== generation.current) return;
      installFiles([...found, ...folderSelection(files)]);
    } catch (reason) {
      if (token === generation.current)
        setError(
          reason instanceof Error && reason.message === "batchLimit"
            ? "batchLimit"
            : "folderRead",
        );
    } finally {
      scans.current.delete(abort);
      if (token === generation.current) setScanning(scans.current.size > 0);
    }
  };
  const convert = async (settings: ConverterSettings) => {
    if (scanning || busy || packing || !items.length) return;
    clearResources();
    const token = generation.current;
    const abort = new AbortController();
    controller.current = abort;
    const queue: BatchItem[] = itemsRef.current.map((item) => {
      const invalid = validateFile(item.file);
      return {
        id: item.id,
        file: item.file,
        path: item.path,
        status: invalid ? "error" : "queued",
        error: invalid ?? undefined,
      };
    });
    setItems(queue);
    setBusy(true);
    const usedNames = new Set<string>();
    let totalBytes = 0;
    for (const item of queue) {
      if (abort.signal.aborted || token !== generation.current) return;
      if (item.error) continue;
      setItems((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, status: "working" } : row,
        ),
      );
      try {
        const encoded = await convertFile(item.file, settings, abort.signal);
        if (abort.signal.aborted || token !== generation.current) return;
        if (totalBytes + encoded.blob.size > MAX_BATCH_BYTES)
          throw new Error("outputLimit");
        totalBytes += encoded.blob.size;
        const url = URL.createObjectURL(encoded.blob);
        ownedUrls.current.add(url);
        const previewUrl = encoded.preview
          ? URL.createObjectURL(encoded.preview)
          : undefined;
        if (previewUrl) ownedUrls.current.add(previewUrl);
        const result = {
          ...encoded,
          url,
          previewUrl,
          name: uniqueOutputName(
            outputName(item.file.name, settings.format),
            usedNames,
          ),
        };
        setItems((current) =>
          current.map((row) =>
            row.id === item.id ? { ...row, status: "done", result } : row,
          ),
        );
      } catch (reason) {
        if (abort.signal.aborted || token !== generation.current) return;
        const message = reason instanceof Error ? reason.message : "encode";
        const failure: ConversionError =
          message === "decode" ||
          message === "dimensions" ||
          message === "outputLimit"
            ? message
            : "encode";
        setItems((current) =>
          current.map((row) =>
            row.id === item.id
              ? { ...row, status: "error", error: failure }
              : row,
          ),
        );
      }
    }
    if (token === generation.current) setBusy(false);
  };
  const downloadAll = async () => {
    if (busy || packing) return;
    const token = archiveVersion.current;
    setPacking(true);
    setError(null);
    try {
      const entries = [];
      for (const item of items) {
        if (!item.result) continue;
        const bytes = new Uint8Array(await item.result.blob.arrayBuffer());
        if (token !== archiveVersion.current) return;
        entries.push({ name: item.result.name, bytes });
      }
      if (!entries.length) return;
      const zip = new Blob([buildZip(entries)], { type: "application/zip" });
      const url = URL.createObjectURL(zip);
      ownedUrls.current.add(url);
      archiveRef.current = url;
      setArchiveUrl(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted-images.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      if (token === archiveVersion.current) setError("archive");
    } finally {
      if (token === archiveVersion.current) setPacking(false);
    }
  };
  const completed = items.filter(
    (item) => item.status === "done" || item.status === "error",
  ).length;
  const successful = items.filter((item) => item.result).length;

  return (
    <section
      className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 text-foreground ${className}`}
    >
      <Link
        href="/mini-project"
        className="inline-flex items-center gap-2 rounded-lg text-sm text-default-600 hover:text-primary focus-visible:outline-primary"
      >
        <HiOutlineArrowLeft aria-hidden="true" />
        {t("imageConvert.back")}
      </Link>
      <header className="my-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HiOutlineSwitchHorizontal aria-hidden="true" className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("imageConvert.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-default-600">
            {t("imageConvert.subtitle")}
          </p>
        </div>
      </header>
      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card isBlurred shadow="none">
          <CardBody className="gap-5 p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                1
              </span>
              {t("imageConvert.upload")}
            </h2>
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                // Capture entries synchronously: the drag data store closes after this event.
                const entries: FileSystemEntry[] = [];
                const files: File[] = [];
                const dropped = Array.from(event.dataTransfer.items ?? []);
                for (const item of dropped) {
                  if (item.kind !== "file") continue;
                  const entry = item.webkitGetAsEntry?.();
                  if (entry) entries.push(entry);
                  else {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                  }
                }
                if (!dropped.length)
                  files.push(...Array.from(event.dataTransfer.files));
                void importDrop(entries, files);
              }}
              className="group flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-default-300 bg-default-100/40 p-5 text-center hover:border-primary hover:bg-primary/5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HiOutlineCloudUpload aria-hidden="true" className="h-8 w-8" />
              </span>
              <span className="max-w-sm text-lg font-semibold">
                {t("imageConvert.choose")}
              </span>
              <span className="text-sm text-default-500">
                {t("imageConvert.limits")}
              </span>

              <input
                ref={input}
                type="file"
                multiple
                accept={IMAGE_ACCEPT}
                className="sr-only"
                onChange={(event) =>
                  selectFiles(Array.from(event.target.files ?? []))
                }
              />
            </label>
            <p className="text-xs leading-relaxed text-default-500">
              {t("imageConvert.inputSupport")}
            </p>
            <p className="text-xs leading-relaxed text-default-500">
              {t("imageConvert.batchLimits")}
            </p>
            <div className="flex flex-col items-start gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-default-300 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-default-100 focus-within:ring-2 focus-within:ring-primary">
                <HiOutlineFolderOpen
                  aria-hidden="true"
                  className="h-5 w-5 text-primary"
                />
                {t("imageConvert.folderPick")}
                <input
                  ref={folderInput}
                  type="file"
                  multiple
                  {...{ webkitdirectory: "" }}
                  className="sr-only"
                  onChange={(event) =>
                    selectFiles(Array.from(event.target.files ?? []), true)
                  }
                />
              </label>
              <p className="text-sm text-default-500">
                {t("imageConvert.folderHint")}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card isBlurred shadow="none">
          <CardBody className="gap-5 p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                2
              </span>
              {t("imageConvert.settings")}
            </h2>
            <FormHookWrapper<ConverterSettings>
              defaultValues={{ format: "image/png", quality: "90" }}
              onSubmit={convert}
              preventEnterSubmit={false}
            >
              {({ watch }) => (
                <fieldset
                  disabled={scanning || busy || packing}
                  className="space-y-5"
                >
                  <InputSelect
                    name="format"
                    label={t("imageConvert.format")}
                    rules={{ required: true }}
                  >
                    {FORMATS.map((format) => (
                      <option key={format} value={format}>
                        {FORMAT_EXTENSIONS[format].toUpperCase()}
                      </option>
                    ))}
                  </InputSelect>
                  {LOSSY_FORMATS.includes(watch("format")) && (
                    <InputSelect
                      name="quality"
                      label={t("imageConvert.quality")}
                      rules={{ required: true }}
                    >
                      {QUALITY_OPTIONS.map((quality) => (
                        <option key={quality} value={quality}>
                          {quality}%
                        </option>
                      ))}
                    </InputSelect>
                  )}
                  <p className="rounded-xl bg-default-100 p-3 text-xs leading-relaxed text-default-600">
                    {t("imageConvert.note")}
                  </p>
                  <p className="text-xs leading-relaxed text-default-500">
                    {t("imageConvert.formatNotes")}
                  </p>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={busy}
                    startContent={
                      !busy && (
                        <HiOutlineSwitchHorizontal
                          aria-hidden="true"
                          className="h-5 w-5"
                        />
                      )
                    }
                    isDisabled={
                      scanning ||
                      busy ||
                      packing ||
                      !items.some((item) => !validateFile(item.file))
                    }
                    className="w-full font-semibold"
                  >
                    {t(busy ? "imageConvert.working" : "imageConvert.convert")}
                  </Button>
                </fieldset>
              )}
            </FormHookWrapper>
          </CardBody>
        </Card>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          {t("imageConvert.results")}
          <span className="rounded-full bg-default-100 px-2.5 py-0.5 text-sm tabular-nums text-default-600">
            {items.length}
          </span>
        </h2>
        <div className="my-2 flex flex-wrap items-center gap-4">
          <p role="status" aria-live="polite">
            {scanning && t("imageConvert.scanning")}
            {items.length > 0 &&
              t("imageConvert.progress", {
                completed,
                total: items.length,
                successful,
              })}
          </p>
          {successful > 0 &&
            (archiveUrl ? (
              <Button
                as="a"
                role="link"
                color="primary"
                startContent={<HiOutlineDownload aria-hidden="true" />}
                href={archiveUrl}
                download="converted-images.zip"
              >
                {t("imageConvert.downloadAll")}
              </Button>
            ) : (
              <Button
                type="button"
                color="primary"
                isDisabled={busy || packing}
                isLoading={packing}
                startContent={
                  !packing && <HiOutlineDownload aria-hidden="true" />
                }
                onPress={() => void downloadAll()}
              >
                {t(
                  packing ? "imageConvert.packing" : "imageConvert.downloadAll",
                )}
              </Button>
            ))}
          <Button
            type="button"
            variant="light"
            startContent={<HiOutlineTrash aria-hidden="true" />}
            onPress={reset}
          >
            {t("imageConvert.reset")}
          </Button>
        </div>
      </div>
      {items.length > 0 && (
        <Progress
          aria-label={t("imageConvert.results")}
          value={completed}
          maxValue={items.length}
          size="sm"
          color="primary"
          disableAnimation
          className="mb-5"
        />
      )}
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger"
        >
          {t(`imageConvert.errors.${error}`)}
        </p>
      )}
      {items.length === 0 && (
        <Card
          isBlurred
          shadow="none"
          className="flex flex-col items-center gap-2 rounded-2xl px-6 py-12 text-center"
        >
          <HiOutlinePhotograph
            aria-hidden="true"
            className="mb-2 h-10 w-10 text-default-400"
          />
          <h3 className="font-semibold">{t("imageConvert.emptyTitle")}</h3>
          <p className="max-w-md text-sm text-default-500">
            {t("imageConvert.emptyHint")}
          </p>
        </Card>
      )}
      <ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy={busy || scanning}
      >
        {items.map((item) => (
          <Card
            as="li"
            isBlurred
            shadow="none"
            key={item.id}
            className="flex min-w-0 flex-col gap-3 rounded-2xl p-4"
          >
            <p className="break-all font-medium">{item.path}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-default-500">
                {(item.file.size / 1024).toFixed(1)} KB
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-medium ${item.status === "error" ? "bg-danger/10 text-danger" : item.status === "done" ? "bg-success/10 text-success-700 dark:text-success-400" : "bg-default-100 text-default-600"}`}
              >
                {t(`imageConvert.status.${item.status}`)}
              </span>
            </div>
            {item.error && (
              <p role="alert" className="text-sm text-danger">
                {t(`imageConvert.errors.${item.error}`)}
              </p>
            )}
            {item.result && (
              <>
                <Image
                  src={item.result.previewUrl ?? item.result.url}
                  alt={t("imageConvert.output")}
                  width={item.result.width}
                  height={item.result.height}
                  unoptimized
                  className="h-44 w-full rounded-xl bg-default-100 p-2 object-contain"
                />
                <p className="break-all text-sm">
                  {item.result.name} ·{" "}
                  {(item.result.blob.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-sm text-default-500">
                  {item.result.width} × {item.result.height}
                </p>
                <Button
                  as="a"
                  role="link"
                  color="primary"
                  variant="flat"
                  startContent={<HiOutlineDownload aria-hidden="true" />}
                  href={item.result.url}
                  download={item.result.name}
                  className="mt-auto w-full shrink-0"
                >
                  {t("imageConvert.download")}
                </Button>
              </>
            )}
          </Card>
        ))}
      </ul>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-default-500">
        <HiOutlineShieldCheck
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-primary"
        />
        {t("imageConvert.privacy")}
      </p>
    </section>
  );
};
export default ImageTypeConvert;
