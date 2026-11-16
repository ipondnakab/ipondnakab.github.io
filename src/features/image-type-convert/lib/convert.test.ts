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
    expect(
      validateFile(new File(["x"], "x.svg", { type: "image/svg+xml" })),
    ).toBe("fileType");
    expect(validateFile(new File([], "x.png", { type: "image/png" }))).toBe(
      "fileSize",
    );
    expect(
      validateFile({ type: "image/png", size: 20 * 1024 * 1024 + 1 } as File),
    ).toBe("fileSize");
  });
  it("replaces only the final extension", () => {
    expect(outputName("holiday.photo.PNG", "image/jpeg")).toBe(
      "holiday.photo.jpg",
    );
    expect(outputName("photo", "image/webp")).toBe("photo.webp");
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
