import type { ArchiveEntry } from "@/features/image-type-convert/model/converter";

export const uniqueOutputName = (name: string, used: Set<string>): string => {
  const safe = name.replace(/[\\/\x00-\x1f]/g, "_");
  const dot = safe.lastIndexOf(".");
  const stem = dot > 0 ? safe.slice(0, dot) : safe;
  const extension = dot > 0 ? safe.slice(dot) : "";
  let candidate = safe;
  let index = 2;
  while (used.has(candidate.toLowerCase()))
    candidate = `${stem} (${index++})${extension}`;
  used.add(candidate.toLowerCase());
  return candidate;
};

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

// ZIP method 0 (stored): images are already compressed; no extra dependency.
export const buildZip = (
  entries: readonly ArchiveEntry[],
): Uint8Array<ArrayBuffer> => {
  const names = entries.map((entry) => new TextEncoder().encode(entry.name));
  const localSize = entries.reduce(
    (sum, entry, i) => sum + 30 + names[i].length + entry.bytes.length,
    0,
  );
  const directorySize = names.reduce((sum, name) => sum + 46 + name.length, 0);
  const zip = new Uint8Array(localSize + directorySize + 22);
  const view = new DataView(zip.buffer);
  let local = 0;
  let directory = localSize;
  entries.forEach((entry, i) => {
    const name = names[i];
    const crc = crc32(entry.bytes);
    view.setUint32(local, 0x04034b50, true);
    view.setUint16(local + 4, 20, true);
    view.setUint16(local + 6, 0x800, true); // UTF-8 names.
    view.setUint16(local + 12, 33, true); // DOS date: 1980-01-01.
    view.setUint32(local + 14, crc, true);
    view.setUint32(local + 18, entry.bytes.length, true);
    view.setUint32(local + 22, entry.bytes.length, true);
    view.setUint16(local + 26, name.length, true);
    zip.set(name, local + 30);
    zip.set(entry.bytes, local + 30 + name.length);
    view.setUint32(directory, 0x02014b50, true);
    view.setUint16(directory + 4, 20, true);
    view.setUint16(directory + 6, 20, true);
    view.setUint16(directory + 8, 0x800, true);
    view.setUint16(directory + 14, 33, true);
    view.setUint32(directory + 16, crc, true);
    view.setUint32(directory + 20, entry.bytes.length, true);
    view.setUint32(directory + 24, entry.bytes.length, true);
    view.setUint16(directory + 28, name.length, true);
    view.setUint32(directory + 42, local, true);
    zip.set(name, directory + 46);
    local += 30 + name.length + entry.bytes.length;
    directory += 46 + name.length;
  });
  view.setUint32(directory, 0x06054b50, true);
  view.setUint16(directory + 8, entries.length, true);
  view.setUint16(directory + 10, entries.length, true);
  view.setUint32(directory + 12, directorySize, true);
  view.setUint32(directory + 16, localSize, true);
  return zip;
};
