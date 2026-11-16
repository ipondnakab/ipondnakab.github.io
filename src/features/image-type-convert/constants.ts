import type { ImageFormat } from "@/features/image-type-convert/model/converter";
export const FORMATS: readonly ImageFormat[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
];
export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_PIXELS = 25_000_000;
export const QUALITY_OPTIONS = ["100", "90", "80", "70", "60"] as const;
