"use client";

import {
  FORMATS,
  FORMAT_EXTENSIONS,
  MAX_BYTES,
  MAX_PIXELS,
} from "@/features/image-type-convert/constants";
import type {
  ConversionError,
  ImageFormat,
} from "@/features/image-type-convert/model/converter";

import {
  encodeBmp,
  encodeGif,
  encodeIco,
  encodeTiff,
} from "@/features/image-type-convert/lib/encode-raster";
import { inputType } from "@/features/image-type-convert/lib/input-type";

export const validateFile = (file: File): ConversionError | null => {
  if (!inputType(file)) return "fileType";
  if (file.size === 0 || file.size > MAX_BYTES) return "fileSize";
  return null;
};

export const outputName = (name: string, format: ImageFormat): string => {
  const stem = name.replace(/\.[^.]+$/, "") || "image";
  return `${stem}.${FORMAT_EXTENSIONS[format]}`;
};

export const convertImage = async (
  image: HTMLImageElement,
  format: ImageFormat,
  quality: number,
): Promise<Blob> => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (
    !width ||
    !height ||
    width * height > MAX_PIXELS ||
    width > 16384 ||
    height > 16384
  )
    throw new Error("dimensions");
  if (
    typeof document === "undefined" ||
    !FORMATS.includes(format) ||
    !Number.isFinite(quality) ||
    quality < 0 ||
    quality > 1
  )
    throw new Error("encode");
  const canvas = document.createElement("canvas");
  const scale =
    format === "image/x-icon" ? Math.min(1, 256 / width, 256 / height) : 1;
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  try {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("encode");
    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    if (format === "image/x-icon") {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else context.drawImage(image, 0, 0);
    if (
      format === "image/bmp" ||
      format === "image/gif" ||
      format === "image/tiff"
    ) {
      const pixels = context.getImageData(0, 0, width, height).data;
      const bytes =
        format === "image/bmp"
          ? encodeBmp(pixels, width, height)
          : format === "image/gif"
            ? encodeGif(pixels, width, height)
            : encodeTiff(pixels, width, height);
      return new Blob([bytes], { type: format });
    }
    if (format === "image/svg+xml" || format === "image/x-icon") {
      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob?.size && blob.type === "image/png"
              ? resolve(blob)
              : reject(new Error("encode")),
          "image/png",
        );
      });
      if (format === "image/x-icon") {
        return new Blob(
          [
            encodeIco(
              new Uint8Array(await png.arrayBuffer()),
              canvas.width,
              canvas.height,
            ),
          ],
          { type: format },
        );
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("encode"));
        reader.onerror = () => reject(new Error("encode"));
        reader.readAsDataURL(png);
      });
      return new Blob(
        [
          `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="${dataUrl}"/></svg>`,
        ],
        { type: format },
      );
    }
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size === 0 || blob.type !== format)
            reject(new Error("encode"));
          else resolve(blob);
        },
        format,
        quality,
      );
    });
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
};
