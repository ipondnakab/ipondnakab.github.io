import {
  buildZip,
  uniqueOutputName,
} from "@/features/image-type-convert/lib/archive";
import { describe, expect, it } from "vitest";

describe("batch downloads", () => {
  it("keeps output names unique after converting different extensions", () => {
    const used = new Set<string>();
    expect(uniqueOutputName("cat.png", used)).toBe("cat.png");
    expect(uniqueOutputName("cat.png", used)).toBe("cat (2).png");
    expect(uniqueOutputName("cat (2).png", used)).toBe("cat (2) (2).png");
    expect(uniqueOutputName("CAT.png", used)).toBe("CAT (3).png");
  });
  it("writes valid ZIP headers, UTF-8 names, CRC32, offsets and directory", () => {
    const zip = buildZip([
      { name: "รูป.png", bytes: new TextEncoder().encode("123456789") },
      { name: "b.png", bytes: new Uint8Array([1, 2]) },
    ]);
    const view = new DataView(zip.buffer);
    const name = new TextEncoder().encode("รูป.png");
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint16(6, true)).toBe(0x800);
    expect(view.getUint32(14, true)).toBe(0xcbf43926);
    expect(view.getUint32(18, true)).toBe(9);
    expect(Array.from(zip.slice(30, 30 + name.length))).toEqual(
      Array.from(name),
    );
    const second = 30 + name.length + 9;
    expect(view.getUint32(second, true)).toBe(0x04034b50);
    const end = zip.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 10, true)).toBe(2);
    const directory = view.getUint32(end + 16, true);
    expect(view.getUint32(directory, true)).toBe(0x02014b50);
    expect(view.getUint32(directory + 46 + name.length + 42, true)).toBe(
      second,
    );
    expect(view.getUint32(end + 12, true)).toBe(end - directory);
  });
});
