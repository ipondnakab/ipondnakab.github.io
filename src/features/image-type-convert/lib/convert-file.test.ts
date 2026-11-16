import { afterEach, describe, expect, it, vi } from "vitest";
import { convertImage } from "@/features/image-type-convert/lib/convert";
import { convertFile } from "@/features/image-type-convert/lib/convert-file";
vi.mock("@/features/image-type-convert/lib/convert", () => ({
  convertImage: vi.fn(),
}));
afterEach(() => vi.unstubAllGlobals());
describe("file decoding lifecycle", () => {
  it("rejects a cancelled decode and releases its URL", async () => {
    vi.stubGlobal(
      "Image",
      class {
        src = "";
        onload = null;
        onerror = null;
      },
    );
    const revoke = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:input",
      revokeObjectURL: revoke,
    });
    const controller = new AbortController();
    const pending = convertFile(
      new File(["x"], "x.png"),
      { format: "image/png", quality: "90" },
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toThrow("cancelled");
    expect(revoke).toHaveBeenCalledWith("blob:input");
  });
  it("does not allocate a URL when already cancelled", async () => {
    const create = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: create });
    await expect(
      convertFile(
        new File(["x"], "x.png"),
        { format: "image/png", quality: "90" },
        AbortSignal.abort(),
      ),
    ).rejects.toThrow("cancelled");
    expect(create).not.toHaveBeenCalled();
  });
  it("adds a PNG preview for TIFF while retaining the TIFF download", async () => {
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 2;
        naturalHeight = 3;
        onload: (() => void) | null = null;
        onerror = null;
        set src(value: string) {
          if (value) queueMicrotask(() => this.onload?.());
        }
      },
    );
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:input",
      revokeObjectURL: vi.fn(),
    });
    const blob = new Blob(["tiff"], { type: "image/tiff" });
    const preview = new Blob(["png"], { type: "image/png" });
    vi.mocked(convertImage)
      .mockReset()
      .mockResolvedValueOnce(blob)
      .mockResolvedValueOnce(preview);
    const result = await convertFile(
      new File(["x"], "image.gif", { type: "image/gif" }),
      { format: "image/tiff", quality: "90" },
      new AbortController().signal,
    );
    expect(result).toEqual({ blob, preview, width: 2, height: 3 });
  });
  it("encodes a loaded image and releases its decode URL", async () => {
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 2;
        naturalHeight = 3;
        onload: (() => void) | null = null;
        onerror = null;
        set src(value: string) {
          if (value) queueMicrotask(() => this.onload?.());
        }
      },
    );
    const revoke = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:input",
      revokeObjectURL: revoke,
    });
    const blob = new Blob(["x"], { type: "image/png" });
    vi.mocked(convertImage).mockResolvedValue(blob);
    await expect(
      convertFile(
        new File(["x"], "x.png"),
        { format: "image/png", quality: "90" },
        new AbortController().signal,
      ),
    ).resolves.toEqual({ blob, width: 2, height: 3 });
    expect(revoke).toHaveBeenCalledWith("blob:input");
  });
});
