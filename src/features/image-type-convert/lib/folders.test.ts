import { describe, expect, it, vi } from "vitest";
import {
  collectFolderImages,
  folderSelection,
} from "@/features/image-type-convert/lib/folders";
const fileEntry = (name: string, type = "image/png"): FileSystemEntry =>
  ({
    name,
    isFile: true,
    isDirectory: false,
    file: (success: (file: File) => void) =>
      success(new File(["x"], name, { type })),
  }) as unknown as FileSystemEntry;
const directory = (name: string, pages: FileSystemEntry[][]): FileSystemEntry =>
  ({
    name,
    isFile: false,
    isDirectory: true,
    createReader: () => {
      let index = 0;
      return {
        readEntries: (success: (entries: FileSystemEntry[]) => void) =>
          success(pages[index++] ?? []),
      };
    },
  }) as unknown as FileSystemEntry;

describe("recursive folder import", () => {
  it("reads every directory page and nested folder, retaining relative paths", async () => {
    const root = directory("Photos", [
      [fileEntry("a.png"), directory("Trip", [[fileEntry("a.png")]])],
      [fileEntry("b.webp", "image/webp")],
      [fileEntry("notes.txt", "text/plain")],
    ]);
    const files = await collectFolderImages(
      [root],
      new AbortController().signal,
    );
    expect(files.map((file) => file.path)).toEqual([
      "Photos/a.png",
      "Photos/Trip/a.png",
      "Photos/b.webp",
    ]);
  });
  it("normalizes missing MIME from supported extensions and keeps picker paths", () => {
    const image = new File(["x"], "PHOTO.JPG");
    Object.defineProperty(image, "webkitRelativePath", {
      value: "Root/Nested/PHOTO.JPG",
    });
    const files = folderSelection([image, new File(["x"], "notes.txt")]);
    expect(files).toHaveLength(1);
    expect(files[0].file.type).toBe("image/jpeg");
    expect(files[0].path).toBe("Root/Nested/PHOTO.JPG");
  });
  it("returns no entries for an empty folder", async () => {
    expect(
      await collectFolderImages(
        [directory("Empty", [])],
        new AbortController().signal,
      ),
    ).toEqual([]);
  });
  it("reports read errors instead of silently losing files", async () => {
    const broken = {
      name: "broken.png",
      isFile: true,
      file: (_success: unknown, fail: () => void) => fail(),
    } as unknown as FileSystemEntry;
    await expect(
      collectFolderImages([broken], new AbortController().signal),
    ).rejects.toThrow("folderRead");
  });
  it("cancels a pending directory read", async () => {
    const read = vi.fn();
    const pending = {
      name: "Slow",
      isDirectory: true,
      createReader: () => ({ readEntries: read }),
    } as unknown as FileSystemEntry;
    const controller = new AbortController();
    const result = collectFolderImages([pending], controller.signal);
    controller.abort();
    await expect(result).rejects.toThrow("cancelled");
    expect(read).toHaveBeenCalledTimes(1);
  });
  it("rejects a folder exceeding the batch limit without truncating it", async () => {
    const root = directory("Large", [
      Array.from({ length: 21 }, (_, i) => fileEntry(`${i}.png`)),
    ]);
    await expect(
      collectFolderImages([root], new AbortController().signal),
    ).rejects.toThrow("batchLimit");
  });
});
