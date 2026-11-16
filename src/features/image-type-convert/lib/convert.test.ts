import { afterEach, describe, expect, it, vi } from "vitest";
import {
  convertImage,
  outputName,
  validateFile,
} from "@/features/image-type-convert/lib/convert";

afterEach(() => vi.restoreAllMocks());
describe("image conversion", () => {
  it("validates file types, empty files and byte limits", () => {
    expect(
      validateFile(new File(["x"], "x.png", { type: "image/png" })),
    ).toBeNull();
    expect(validateFile(new File(["x"], "x.txt", { type: "text/plain" }))).toBe(
      "fileType",
    );
    expect(validateFile(new File([], "x.png", { type: "image/png" }))).toBe(
      "fileSize",
    );
    expect(
      validateFile({ type: "image/png", size: 20 * 1024 * 1024 + 1 } as File),
    ).toBe("fileSize");
  });
  it("accepts additional image MIME types and missing image MIME metadata", () => {
    for (const type of [
      "image/gif",
      "image/bmp",
      "image/svg+xml",
      "image/avif",
      "image/heic",
      "image/tiff",
      "image/x-icon",
    ]) {
      expect(validateFile(new File(["x"], "image", { type }))).toBeNull();
    }
    expect(validateFile(new File(["x"], "PHOTO.GIF"))).toBeNull();
    expect(validateFile(new File(["x"], "notes.txt"))).toBe("fileType");
  });
  it("replaces only the final extension", () => {
    expect(outputName("holiday.photo.PNG", "image/jpeg")).toBe(
      "holiday.photo.jpg",
    );
    expect(outputName("photo", "image/webp")).toBe("photo.webp");
    expect(outputName("photo.png", "image/svg+xml")).toBe("photo.svg");
    expect(outputName("photo.png", "image/x-icon")).toBe("photo.ico");
  });
  it("flattens JPEG onto white and passes quality to encoder", async () => {
    const context = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as ReturnType<HTMLCanvasElement["getContext"]>,
    );
    const encode = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((cb, mime) =>
        cb(new Blob(["encoded"], { type: mime })),
      );
    const result = await convertImage(
      { naturalWidth: 100, naturalHeight: 80 } as HTMLImageElement,
      "image/jpeg",
      0.8,
    );
    expect(context.fillStyle).toBe("#ffffff");
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 100, 80);
    expect(encode).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.8,
    );
    expect(result.type).toBe("image/jpeg");
  });
  it("rejects silent encoder fallback and preserves PNG alpha", async () => {
    const context = { fillRect: vi.fn(), drawImage: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as ReturnType<HTMLCanvasElement["getContext"]>,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
      cb(new Blob(["x"], { type: "image/png" })),
    );
    await expect(
      convertImage(
        { naturalWidth: 1, naturalHeight: 1 } as HTMLImageElement,
        "image/webp",
        0.9,
      ),
    ).rejects.toThrow("encode");
    await convertImage(
      { naturalWidth: 1, naturalHeight: 1 } as HTMLImageElement,
      "image/png",
      0.9,
    );
    expect(context.fillRect).not.toHaveBeenCalled();
  });
  it("rejects missing context and empty encoder output", async () => {
    const image = { naturalWidth: 1, naturalHeight: 1 } as HTMLImageElement;
    const context = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);
    await expect(convertImage(image, "image/png", 1)).rejects.toThrow("encode");
    context.mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
      cb(null),
    );
    await expect(convertImage(image, "image/png", 1)).rejects.toThrow("encode");
  });
  it("encodes portable formats with matching MIME and releases the canvas", async () => {
    const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
      getImageData: () => ({ data: pixels }),
    } as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
    const image = { naturalWidth: 1, naturalHeight: 1 } as HTMLImageElement;
    for (const format of ["image/bmp", "image/gif", "image/tiff"] as const) {
      const blob = await convertImage(image, format, 1);
      expect(blob.type).toBe(format);
      expect(blob.size).toBeGreaterThan(4);
    }
  });
  it("limits ICO dimensions and embeds a PNG without passing ICO to the browser encoder", async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
    const encode = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((cb) => {
        const blob = new Blob(["png"], { type: "image/png" });
        Object.defineProperty(blob, "arrayBuffer", {
          value: async () => new Uint8Array([137, 80, 78, 71]).buffer,
        });
        cb(blob);
      });
    const blob = await convertImage(
      { naturalWidth: 1024, naturalHeight: 512 } as HTMLImageElement,
      "image/x-icon",
      1,
    );
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 256, 128);
    expect(encode).toHaveBeenCalledWith(expect.any(Function), "image/png");
    expect(blob.type).toBe("image/x-icon");
  });
  it("exports an SVG containing only an encoded PNG image", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
      cb(new Blob(["png"], { type: "image/png" })),
    );
    const blob = await convertImage(
      { naturalWidth: 2, naturalHeight: 3 } as HTMLImageElement,
      "image/svg+xml",
      1,
    );
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    expect(blob.type).toBe("image/svg+xml");
    expect(text).toContain('viewBox="0 0 2 3"');
    expect(text).toContain('href="data:image/png;base64,');
    expect(text).not.toContain("<script");
  });
  it("rejects excessive dimensions before allocating a canvas", async () => {
    await expect(
      convertImage(
        { naturalWidth: 10000, naturalHeight: 10000 } as HTMLImageElement,
        "image/png",
        1,
      ),
    ).rejects.toThrow("dimensions");
  });
});
