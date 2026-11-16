import { describe, expect, it } from "vitest";
import { appendFiles } from "@/features/image-type-convert/lib/append-files";
import type {
  BatchItem,
  SelectedImage,
} from "@/features/image-type-convert/model/converter";
const selected = (path: string, size = 1): SelectedImage => ({
  path,
  file: new File([new Uint8Array(size)], path.split("/").pop()!, {
    type: "image/png",
    lastModified: 123,
  }),
});
describe("append image selection", () => {
  it("preserves existing rows and gives new rows distinct IDs", () => {
    const old: BatchItem = {
      ...selected("a.png"),
      id: 7,
      status: "done",
      result: {
        url: "blob:old",
        name: "a.png",
        blob: new Blob(["x"]),
        width: 1,
        height: 1,
      },
    };
    const result = appendFiles([old], [selected("b.png")]);
    expect(result[0]).toBe(old);
    expect(result[1]).toMatchObject({ id: 8, path: "b.png", status: "queued" });
  });
  it("skips duplicates but keeps same names in different folder paths", () => {
    const first = appendFiles(
      [],
      [selected("Root/a.png"), selected("Root/a.png")],
    );
    expect(appendFiles(first, [selected("Root/a.png")])).toBe(first);
    expect(appendFiles(first, [selected("Other/a.png")])).toHaveLength(2);
  });
  it("checks combined count and bytes without mutating the existing batch", () => {
    const existing = appendFiles(
      [],
      Array.from({ length: 20 }, (_, n) => selected(`${n}.png`)),
    );
    expect(() => appendFiles(existing, [selected("extra.png")])).toThrow(
      "batchLimit",
    );
    expect(existing).toHaveLength(20);
    expect(appendFiles(existing, [selected("0.png")])).toBe(existing);
    const huge = selected("large.png");
    Object.defineProperty(huge.file, "size", { value: 100 * 1024 * 1024 });
    const full = appendFiles([], [huge]);
    expect(() => appendFiles(full, [selected("extra.png")])).toThrow(
      "batchLimit",
    );
  });
});
