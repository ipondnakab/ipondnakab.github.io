export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";
export interface ConverterSettings {
  format: ImageFormat;
  quality: string;
}
export interface EncodedImage {
  blob: Blob;
  width: number;
  height: number;
}
export interface ConvertedImage extends EncodedImage {
  url: string;
  name: string;
}
export interface SelectedImage {
  file: File;
  path: string;
}
export interface BatchItem extends SelectedImage {
  id: number;
  status: "queued" | "working" | "done" | "error";
  error?: ConversionError;
  result?: ConvertedImage;
}
export interface ArchiveEntry {
  name: string;
  bytes: Uint8Array;
}
export type ConversionError =
  | "fileType"
  | "fileSize"
  | "decode"
  | "dimensions"
  | "encode"
  | "batchLimit"
  | "outputLimit"
  | "archive"
  | "folderRead"
  | "noImages";
