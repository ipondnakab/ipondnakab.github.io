"use client";
import { convertImage } from "@/features/image-type-convert/lib/convert";
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
  const url = URL.createObjectURL(file);
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
    return { blob, width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    signal.removeEventListener("abort", cancel);
    image.onload = null;
    image.onerror = null;
    image.src = "";
    URL.revokeObjectURL(url);
  }
};
