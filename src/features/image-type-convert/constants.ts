import type { ImageFormat } from "@/features/image-type-convert/model/converter";
export const FORMATS: readonly ImageFormat[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "image/svg+xml",
];
export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_PIXELS = 25_000_000;
export const QUALITY_OPTIONS = ["100", "90", "80", "70", "60"] as const;
export const MAX_BATCH_FILES = 20;
export const MAX_BATCH_BYTES = 100 * 1024 * 1024;

export const FORMAT_EXTENSIONS: Record<ImageFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/x-icon": "ico",
  "image/svg+xml": "svg",
};
export const INPUT_EXTENSIONS: Record<string, string> = {
  png: "image/png",
  apng: "image/apng",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jfif: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  dib: "image/bmp",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  ico: "image/x-icon",
  cur: "image/x-icon",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  tif: "image/tiff",
  tiff: "image/tiff",
  jxl: "image/jxl",
  jp2: "image/jp2",
  j2k: "image/jp2",
  dng: "image/x-adobe-dng",
  cr2: "image/x-canon-cr2",
  nef: "image/x-nikon-nef",
  arw: "image/x-sony-arw",
  raf: "image/x-fuji-raf",
  orf: "image/x-olympus-orf",
};
export const IMAGE_ACCEPT = `image/*,${Object.keys(INPUT_EXTENSIONS)
  .map((extension) => `.${extension}`)
  .join(",")}`;
export const LOSSY_FORMATS: readonly ImageFormat[] = [
  "image/jpeg",
  "image/webp",
];
