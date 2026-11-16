export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";
export interface ConverterSettings {
  format: ImageFormat;
  quality: string;
}
export interface SourceImage {
  file: File;
  url: string;
  image: HTMLImageElement;
}
export interface ConvertedImage {
  url: string;
  name: string;
  size: number;
}
export type ConversionError =
  "fileType" | "fileSize" | "decode" | "dimensions" | "encode";
