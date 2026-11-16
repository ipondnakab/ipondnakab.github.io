"use client";

import {
  FORMATS,
  MAX_BYTES,
  MAX_PIXELS,
} from "@/features/image-type-convert/constants";
import type {
  ConversionError,
  ImageFormat,
} from "@/features/image-type-convert/model/converter";

export const validateFile = (file: File): ConversionError | null => {
  if (!FORMATS.includes(file.type as ImageFormat)) return "fileType";
  if (file.size === 0 || file.size > MAX_BYTES) return "fileSize";
  return null;
};

export const outputName = (name: string, format: ImageFormat): string => {
  const stem = name.replace(/\.[^.]+$/, "") || "image";
  return `${stem}.${format === "image/jpeg" ? "jpg" : format.slice(6)}`;
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
  canvas.width = width;
  canvas.height = height;
  try {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("encode");
    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0);
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
