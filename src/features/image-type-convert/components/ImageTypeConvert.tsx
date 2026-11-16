"use client";

import {
  FORMATS,
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
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
        const result = {
          ...encoded,
          url,
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
      className={`mx-auto w-full max-w-5xl px-4 py-10 text-foreground ${className}`}
    >
      <Link
        href="/mini-project"
        className="text-sm text-primary underline underline-offset-4"
      >
        {t("imageConvert.back")}
      </Link>
      <h1 className="mt-6 text-3xl font-bold sm:text-5xl">
        {t("imageConvert.title")}
      </h1>
      <p className="mt-4 text-default-500">{t("imageConvert.subtitle")}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
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
          className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 p-6 text-center focus-within:ring-2 focus-within:ring-primary"
        >
          <span className="text-lg font-semibold">
            {t("imageConvert.choose")}
          </span>
          <span className="text-sm text-default-500">
            {t("imageConvert.limits")}
          </span>
          <span className="text-sm text-default-500">
            {t("imageConvert.batchLimits")}
          </span>
          <input
            ref={input}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) =>
              selectFiles(Array.from(event.target.files ?? []))
            }
          />
        </label>
        <div className="rounded-2xl border border-default-200 bg-content1 p-6">
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
                      {format.slice(6).toUpperCase()}
                    </option>
                  ))}
                </InputSelect>
                {watch("format") !== "image/png" && (
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
                <p className="text-sm text-default-500">
                  {t("imageConvert.note")}
                </p>
                <button
                  type="submit"
                  disabled={
                    scanning ||
                    busy ||
                    packing ||
                    !items.some((item) => !validateFile(item.file))
                  }
                  className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {t(busy ? "imageConvert.working" : "imageConvert.convert")}
                </button>
              </fieldset>
            )}
          </FormHookWrapper>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="cursor-pointer rounded-xl border border-primary px-5 py-3 text-primary focus-within:ring-2 focus-within:ring-primary">
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
      <div className="my-5 flex flex-wrap items-center gap-4">
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
            <a
              href={archiveUrl}
              download="converted-images.zip"
              className="rounded-xl bg-success px-5 py-3 font-semibold text-success-foreground"
            >
              {t("imageConvert.downloadAll")}
            </a>
          ) : (
            <button
              type="button"
              disabled={busy || packing}
              onClick={() => void downloadAll()}
              className="rounded-xl bg-success px-5 py-3 font-semibold text-success-foreground disabled:opacity-50"
            >
              {t(packing ? "imageConvert.packing" : "imageConvert.downloadAll")}
            </button>
          ))}
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-2 text-sm text-default-500 underline"
        >
          {t("imageConvert.reset")}
        </button>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-danger">
          {t(`imageConvert.errors.${error}`)}
        </p>
      )}
      <ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy={busy || scanning}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="min-w-0 space-y-3 rounded-2xl border border-default-200 bg-content1 p-4"
          >
            <p className="break-all font-medium">{item.path}</p>
            <p className="text-sm text-default-500">
              {(item.file.size / 1024).toFixed(1)} KB ·{" "}
              {t(`imageConvert.status.${item.status}`)}
            </p>
            {item.error && (
              <p role="alert" className="text-sm text-danger">
                {t(`imageConvert.errors.${item.error}`)}
              </p>
            )}
            {item.result && (
              <>
                <Image
                  src={item.result.url}
                  alt={t("imageConvert.output")}
                  width={item.result.width}
                  height={item.result.height}
                  unoptimized
                  className="h-40 w-full rounded-lg object-contain"
                />
                <p className="break-all text-sm">
                  {item.result.name} ·{" "}
                  {(item.result.blob.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-sm text-default-500">
                  {item.result.width} × {item.result.height}
                </p>
                <a
                  href={item.result.url}
                  download={item.result.name}
                  className="block rounded-xl bg-primary px-4 py-2 text-center text-primary-foreground"
                >
                  {t("imageConvert.download")}
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-center text-sm text-default-500">
        {t("imageConvert.privacy")}
      </p>
    </section>
  );
};
export default ImageTypeConvert;
