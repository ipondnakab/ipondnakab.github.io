import ImageTypeConvert from "@/features/image-type-convert/components/ImageTypeConvert";
import { convertFile } from "@/features/image-type-convert/lib/convert-file";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/features/image-type-convert/lib/convert-file", () => ({
  convertFile: vi.fn(),
}));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const select = (files: File[]) =>
  fireEvent.change(screen.getByLabelText(/imageConvert.choose/), {
    target: { files },
  });
const encodedBlob = () => {
  const blob = new Blob(["png"], { type: "image/png" });
  Object.defineProperty(blob, "arrayBuffer", {
    value: async () => new Uint8Array([1, 2, 3]).buffer,
  });
  return blob;
};
const png = (name: string) => new File(["x"], name, { type: "image/png" });

describe("image converter controls", () => {
  it("accepts multiple images and continues after one fails", async () => {
    let nextUrl = 0;
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = vi.fn(() => `blob:output-${++nextUrl}`);
        static revokeObjectURL = vi.fn();
      },
    );
    vi.mocked(convertFile)
      .mockReset()
      .mockResolvedValueOnce({
        blob: encodedBlob(),
        width: 2,
        height: 2,
      })
      .mockRejectedValueOnce(new Error("decode"))
      .mockResolvedValueOnce({
        blob: encodedBlob(),
        width: 2,
        height: 2,
      });
    render(<ImageTypeConvert />);
    expect(screen.getByLabelText(/imageConvert.choose/)).toHaveAttribute(
      "multiple",
    );
    expect(
      screen.getByRole("button", { name: "imageConvert.convert" }),
    ).toBeDisabled();
    select([png("a.png"), png("bad.png"), png("a.jpeg")]);
    fireEvent.click(
      screen.getByRole("button", { name: "imageConvert.convert" }),
    );
    await waitFor(() =>
      expect(
        screen.getAllByRole("link", { name: "imageConvert.download" }),
      ).toHaveLength(2),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "imageConvert.errors.decode",
    );
    expect(
      screen.getAllByRole("link", { name: "imageConvert.download" })[1],
    ).toHaveAttribute("download", "a (2).png");
    expect(
      screen.getByRole("button", { name: "imageConvert.downloadAll" }),
    ).toBeEnabled();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fireEvent.click(
      screen.getByRole("button", { name: "imageConvert.downloadAll" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "imageConvert.downloadAll" }),
      ).toHaveAttribute("download", "converted-images.zip"),
    );
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "imageConvert.reset" }));
    expect(
      screen.queryAllByRole("link", { name: "imageConvert.download" }),
    ).toHaveLength(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
  });
  it("discards pending results when a batch is replaced", async () => {
    const create = vi.fn();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = create;
        static revokeObjectURL = vi.fn();
      },
    );
    let finish!: (value: Awaited<ReturnType<typeof convertFile>>) => void;
    vi.mocked(convertFile)
      .mockReset()
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
    render(<ImageTypeConvert />);
    select([png("old.png")]);
    fireEvent.click(
      screen.getByRole("button", { name: "imageConvert.convert" }),
    );
    await waitFor(() => expect(convertFile).toHaveBeenCalledTimes(1));
    const signal = vi.mocked(convertFile).mock.calls[0][2];
    select([png("new.png")]);
    expect(signal.aborted).toBe(true);
    finish({ blob: new Blob(["x"]), width: 1, height: 1 });
    await waitFor(() =>
      expect(screen.getByText("new.png")).toBeInTheDocument(),
    );
    expect(create).not.toHaveBeenCalled();
    expect(screen.queryByText("old.png")).not.toBeInTheDocument();
  });
  it("rejects excessive batches and reports invalid files individually", () => {
    render(<ImageTypeConvert />);
    select(Array.from({ length: 21 }, (_, n) => png(`${n}.png`)));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "imageConvert.errors.batchLimit",
    );
    select([
      new File(["x"], "file.txt", { type: "text/plain" }),
      png("good.png"),
    ]);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "imageConvert.errors.fileType",
    );
    expect(
      screen.getByRole("button", { name: "imageConvert.convert" }),
    ).toBeEnabled();
  });
  it("shows relative paths from the folder picker and skips other files", () => {
    render(<ImageTypeConvert />);
    const file = png("photo.png");
    Object.defineProperty(file, "webkitRelativePath", {
      value: "Root/Trip/photo.png",
    });
    const picker = screen.getByLabelText("imageConvert.folderPick");
    expect(picker).toHaveAttribute("webkitdirectory");
    fireEvent.change(picker, {
      target: {
        files: [file, new File(["x"], "notes.txt", { type: "text/plain" })],
      },
    });
    expect(screen.getByText("Root/Trip/photo.png")).toBeInTheDocument();
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });
  it("scans dropped folders and ignores a cancelled scan", async () => {
    render(<ImageTypeConvert />);
    let finish!: (entries: FileSystemEntry[]) => void;
    const directory = {
      name: "Root",
      isDirectory: true,
      createReader: () => ({
        readEntries: (success: typeof finish) => {
          finish = success;
        },
      }),
    };
    const drop = screen.getByText("imageConvert.choose").closest("label")!;
    fireEvent.drop(drop, {
      dataTransfer: {
        files: [],
        items: [{ kind: "file", webkitGetAsEntry: () => directory }],
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "imageConvert.scanning",
    );
    fireEvent.click(screen.getByRole("button", { name: "imageConvert.reset" }));
    finish([]);
    await waitFor(() =>
      expect(screen.getByRole("status")).not.toHaveTextContent(
        "imageConvert.scanning",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("offers quality only for lossy formats", async () => {
    render(<ImageTypeConvert />);
    expect(
      screen.queryByLabelText("imageConvert.quality"),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("imageConvert.format"), {
      target: { value: "image/jpeg" },
    });
    await waitFor(() =>
      expect(screen.getByLabelText("imageConvert.quality")).toBeInTheDocument(),
    );
  });
});
