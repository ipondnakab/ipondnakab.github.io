import {
  MAX_BATCH_BYTES,
  MAX_BATCH_FILES,
} from "@/features/image-type-convert/constants";
import { validateFile } from "@/features/image-type-convert/lib/convert";
import type {
  BatchItem,
  SelectedImage,
} from "@/features/image-type-convert/model/converter";

// Path distinguishes equal filenames in different folders; metadata avoids
// treating a changed file at the same path as the previous selection.
const identity = ({ file, path }: SelectedImage): string =>
  JSON.stringify([path, file.size, file.lastModified]);
export const appendFiles = (
  existing: BatchItem[],
  incoming: readonly SelectedImage[],
): BatchItem[] => {
  const seen = new Set(existing.map(identity));
  const additions: SelectedImage[] = [];
  for (const image of incoming) {
    const key = identity(image);
    if (seen.has(key)) continue;
    seen.add(key);
    additions.push(image);
  }
  if (!additions.length) return existing;
  if (
    existing.length + additions.length > MAX_BATCH_FILES ||
    [...existing, ...additions].reduce(
      (bytes, image) => bytes + image.file.size,
      0,
    ) > MAX_BATCH_BYTES
  )
    throw new Error("batchLimit");
  const nextId =
    existing.reduce((max, image) => Math.max(max, image.id), -1) + 1;
  return [
    ...existing,
    ...additions.map((image, index): BatchItem => {
      const error = validateFile(image.file);
      return {
        ...image,
        id: nextId + index,
        status: error ? "error" : "queued",
        error: error ?? undefined,
      };
    }),
  ];
};
