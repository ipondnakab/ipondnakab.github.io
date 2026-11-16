"use client";

import {
  FORMATS,
  MAX_PIXELS,
  QUALITY_OPTIONS,
} from "@/features/image-type-convert/constants";
import {
  convertImage,
  outputName,
  validateFile,
} from "@/features/image-type-convert/lib/convert";
import type {
  ConversionError,
  ConvertedImage,
  ConverterSettings,
  SourceImage,
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
  const [source, setSource] = useState<SourceImage | null>(null);
  const [result, setResult] = useState<ConvertedImage | null>(null);
  const [error, setError] = useState<ConversionError | null>(null);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source.url);
    },
    [source],
  );
  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result],
  );

  const reset = () => {
    generation.current += 1;
    setSource(null);
    setResult(null);
    setError(null);
    setBusy(false);
    if (input.current) input.current.value = "";
  };
  const selectFile = async (file: File) => {
    reset();
    const token = generation.current;
    const invalid = validateFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("decode"));
        image.src = url;
      });
      if (
        !image.naturalWidth ||
        !image.naturalHeight ||
        image.naturalWidth * image.naturalHeight > MAX_PIXELS ||
        image.naturalWidth > 16384 ||
        image.naturalHeight > 16384
      )
        throw new Error("dimensions");
      if (token !== generation.current) {
        URL.revokeObjectURL(url);
        return;
      }
      setSource({ file, url, image });
    } catch (reason) {
      URL.revokeObjectURL(url);
      if (token === generation.current)
        setError(
          reason instanceof Error && reason.message === "dimensions"
            ? "dimensions"
            : "decode",
        );
    } finally {
      image.onload = null;
      image.onerror = null;
      if (token === generation.current) setBusy(false);
    }
  };
  const convert = async ({ format, quality }: ConverterSettings) => {
    if (!source || busy) return;
    const token = ++generation.current;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const blob = await convertImage(
        source.image,
        format,
        Number(quality) / 100,
      );
      if (token === generation.current)
        setResult({
          url: URL.createObjectURL(blob),
          name: outputName(source.file.name, format),
          size: blob.size,
        });
    } catch {
      if (token === generation.current) setError("encode");
    } finally {
      if (token === generation.current) setBusy(false);
    }
  };

  return (
    <section
      className={`mx-auto w-full max-w-4xl px-4 py-10 text-foreground ${className}`}
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
        <div className="rounded-2xl border border-default-200 bg-content1 p-6">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (file) void selectFile(file);
            }}
            className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 p-5 text-center focus-within:ring-2 focus-within:ring-primary"
          >
            <span className="text-lg font-semibold">
              {t("imageConvert.choose")}
            </span>
            <span className="text-sm text-default-500">
              {t("imageConvert.limits")}
            </span>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void selectFile(file);
              }}
            />
          </label>
          {source && (
            <div className="mt-5 space-y-2">
              <Image
                src={source.url}
                alt={t("imageConvert.original")}
                width={source.image.naturalWidth}
                height={source.image.naturalHeight}
                unoptimized
                className="h-52 w-full rounded-lg object-contain"
              />
              <p className="break-all text-sm">{source.file.name}</p>
              <p className="text-sm text-default-500">
                {source.image.naturalWidth} × {source.image.naturalHeight} ·{" "}
                {(source.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-default-200 bg-content1 p-6">
          <FormHookWrapper<ConverterSettings>
            defaultValues={{ format: "image/png", quality: "90" }}
            onSubmit={convert}
            preventEnterSubmit={false}
          >
            {({ watch }) => (
              <fieldset disabled={busy} className="space-y-5">
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
                  disabled={!source || busy}
                  className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {t(busy ? "imageConvert.working" : "imageConvert.convert")}
                </button>
              </fieldset>
            )}
          </FormHookWrapper>
          <div aria-live="polite" aria-busy={busy} className="mt-4">
            {busy && <p role="status">{t("imageConvert.working")}</p>}
            {error && (
              <p role="alert" className="text-danger">
                {t(`imageConvert.errors.${error}`)}
              </p>
            )}
            {result && (
              <div className="space-y-3">
                <Image
                  src={result.url}
                  alt={t("imageConvert.output")}
                  width={source?.image.naturalWidth ?? 1}
                  height={source?.image.naturalHeight ?? 1}
                  unoptimized
                  className="h-40 w-full rounded-lg object-contain"
                />
                <p className="break-all text-sm">
                  {result.name} · {(result.size / 1024).toFixed(1)} KB
                </p>
                <a
                  href={result.url}
                  download={result.name}
                  className="block rounded-xl bg-success px-5 py-3 text-center font-semibold text-success-foreground"
                >
                  {t("imageConvert.download")}
                </a>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg px-3 py-2 text-sm text-default-500 underline"
          >
            {t("imageConvert.reset")}
          </button>
        </div>
      </div>
      <p className="mt-5 text-center text-sm text-default-500">
        {t("imageConvert.privacy")}
      </p>
    </section>
  );
};
export default ImageTypeConvert;
