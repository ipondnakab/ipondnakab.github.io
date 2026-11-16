import { describe, expect, it } from "vitest";
import {
  encodeBmp,
  encodeGif,
  encodeIco,
  encodeTiff,
} from "@/features/image-type-convert/lib/encode-raster";

const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 0]);

describe("portable image encoders", () => {
  it("writes a padded bottom-up 24-bit BMP", () => {
    const bytes = encodeBmp(pixels, 1, 2);
    const view = new DataView(bytes.buffer);
    expect(Array.from(bytes.slice(0, 2))).toEqual([66, 77]);
    expect(view.getUint32(2, true)).toBe(bytes.length);
    expect(view.getUint32(10, true)).toBe(54);
    expect(view.getInt32(18, true)).toBe(1);
    expect(view.getInt32(22, true)).toBe(2);
    expect(Array.from(bytes.slice(54))).toEqual([
      255, 255, 255, 0, 0, 0, 255, 0,
    ]);
  });
  it("writes TIFF dimensions and uncompressed RGBA pixels", () => {
    const bytes = encodeTiff(pixels, 2, 1);
    const view = new DataView(bytes.buffer);
    expect(Array.from(bytes.slice(0, 4))).toEqual([73, 73, 42, 0]);
    expect(view.getUint32(4, true)).toBe(8);
    const count = view.getUint16(8, true);
    const tags = new Map<number, number>();
    for (let i = 0; i < count; i++) {
      const offset = 10 + 12 * i;
      tags.set(view.getUint16(offset, true), view.getUint32(offset + 8, true));
    }
    expect(tags.get(256)).toBe(2);
    expect(tags.get(257)).toBe(1);
    expect(tags.get(259)).toBe(1);
    expect(tags.get(338)).toBe(2);
    expect(Array.from(bytes.slice(tags.get(273)))).toEqual(Array.from(pixels));
  });
  it("writes GIF89a with transparent palette and a terminated image stream", () => {
    const bytes = encodeGif(pixels, 2, 1);
    expect(String.fromCharCode(...bytes.slice(0, 6))).toBe("GIF89a");
    expect(Array.from(bytes.slice(6, 10))).toEqual([2, 0, 1, 0]);
    expect(bytes[bytes.length - 1]).toBe(0x3b);
    // GCE declares transparency with palette index zero.
    expect(Array.from(bytes.slice(781, 789))).toEqual([
      0x21, 0xf9, 4, 1, 0, 0, 0, 0,
    ]);
  });
  it("wraps PNG bytes in an ICO directory with correct dimensions and offsets", () => {
    const png = new Uint8Array([137, 80, 78, 71]);
    const bytes = encodeIco(png, 256, 128);
    const view = new DataView(bytes.buffer);
    expect(Array.from(bytes.slice(0, 8))).toEqual([0, 0, 1, 0, 1, 0, 0, 128]);
    expect(view.getUint32(14, true)).toBe(4);
    expect(view.getUint32(18, true)).toBe(22);
    expect(Array.from(bytes.slice(22))).toEqual(Array.from(png));
    expect(() => encodeIco(png, 257, 1)).toThrow("dimensions");
  });
});
