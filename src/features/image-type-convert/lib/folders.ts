"use client";
import {
  FORMATS,
  MAX_BATCH_BYTES,
  MAX_BATCH_FILES,
} from "@/features/image-type-convert/constants";
import type {
  ImageFormat,
  SelectedImage,
} from "@/features/image-type-convert/model/converter";

const imageFile = (file: File): File | null => {
  if (FORMATS.includes(file.type as ImageFormat)) return file;
  if (file.type) return null;
  const extension = file.name.split(".").pop()?.toLowerCase();
  const type =
    extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : null;
  return type
    ? new File([file], file.name, { type, lastModified: file.lastModified })
    : null;
};

export const folderSelection = (files: readonly File[]): SelectedImage[] =>
  files.flatMap((file) => {
    const image = imageFile(file);
    return image
      ? [{ file: image, path: file.webkitRelativePath || file.name }]
      : [];
  });

const readEntry = <T>(
  start: (success: (result: T) => void, failure: () => void) => void,
  signal: AbortSignal,
): Promise<T> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("cancelled"));
      return;
    }
    const cancel = () => {
      signal.removeEventListener("abort", cancel);
      reject(new Error("cancelled"));
    };
    signal.addEventListener("abort", cancel, { once: true });
    const success = (result: T) => {
      signal.removeEventListener("abort", cancel);
      resolve(result);
    };
    const failure = () => {
      signal.removeEventListener("abort", cancel);
      reject(new Error("folderRead"));
    };
    try {
      start(success, failure);
    } catch {
      failure();
    }
  });

export const collectFolderImages = async (
  entries: readonly FileSystemEntry[],
  signal: AbortSignal,
): Promise<SelectedImage[]> => {
  const result: SelectedImage[] = [];
  let bytes = 0;
  const visit = async (
    entry: FileSystemEntry,
    parent: string,
  ): Promise<void> => {
    if (signal.aborted) throw new Error("cancelled");
    const path = parent ? `${parent}/${entry.name}` : entry.name;
    if (entry.isFile) {
      const file = await readEntry<File>(
        (success, failure) =>
          (entry as FileSystemFileEntry).file(success, failure),
        signal,
      );
      if (signal.aborted) throw new Error("cancelled");
      const image = imageFile(file);
      if (!image) return;
      bytes += image.size;
      if (result.length >= MAX_BATCH_FILES || bytes > MAX_BATCH_BYTES)
        throw new Error("batchLimit");
      result.push({ file: image, path });
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // A directory may be returned in multiple batches; read until empty.
      while (true) {
        const children = await readEntry<FileSystemEntry[]>(
          (success, failure) => reader.readEntries(success, failure),
          signal,
        );
        if (signal.aborted) throw new Error("cancelled");
        if (!children.length) break;
        for (const child of children) await visit(child, path);
      }
    }
  };
  for (const entry of entries) await visit(entry, "");
  return result;
};
