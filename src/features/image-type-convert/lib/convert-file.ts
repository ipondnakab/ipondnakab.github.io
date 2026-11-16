"use client";
import { convertImage } from "@/features/image-type-convert/lib/convert";
import { normalizeImageFile } from "@/features/image-type-convert/lib/input-type";
import type {
  ConverterSettings,
  EncodedImage,
} from "@/features/image-type-convert/model/converter";

export const convertFile = async (
  file: File,
  settings: ConverterSettings,
  signal: AbortSignal,
): Promise<EncodedImage> => {
  if (signal.aborted) throw new Error("cancelled");
  const url = URL.createObjectURL(normalizeImageFile(file));
  const image = new Image();
  let cancel: () => void = () => {};
  try {
    await new Promise<void>((resolve, reject) => {
      cancel = () => reject(new Error("cancelled"));
      signal.addEventListener("abort", cancel, { once: true });
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("decode"));
      image.src = url;
    });
    if (signal.aborted) throw new Error("cancelled");
    const blob = await convertImage(
      image,
      settings.format,
      Number(settings.quality) / 100,
    );
    if (signal.aborted) throw new Error("cancelled");
    const scale =
      settings.format === "image/x-icon"
        ? Math.min(1, 256 / image.naturalWidth, 256 / image.naturalHeight)
        : 1;
    const preview =
      settings.format === "image/tiff"
        ? await convertImage(image, "image/png", 1)
        : undefined;
    if (signal.aborted) throw new Error("cancelled");
    return {
      blob,
      width: Math.max(1, Math.round(image.naturalWidth * scale)),
      height: Math.max(1, Math.round(image.naturalHeight * scale)),
      ...(preview ? { preview } : {}),
    };
  } finally {
    signal.removeEventListener("abort", cancel);
    image.onload = null;
    image.onerror = null;
    image.src = "";
    URL.revokeObjectURL(url);
  }
};
