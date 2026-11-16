import { INPUT_EXTENSIONS } from "@/features/image-type-convert/constants";

export const inputType = (file: File): string | null => {
  if (file.type.toLowerCase().startsWith("image/"))
    return file.type.toLowerCase();
  if (file.type && file.type !== "application/octet-stream") return null;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? (INPUT_EXTENSIONS[extension] ?? null) : null;
};

export const normalizeImageFile = (file: File): File => {
  const type = inputType(file);
  return type && type !== file.type
    ? new File([file], file.name, { type, lastModified: file.lastModified })
    : file;
};
