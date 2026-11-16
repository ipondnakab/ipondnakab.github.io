import ImageTypeConvert from "@/features/image-type-convert/components/ImageTypeConvert";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
afterEach(() => vi.restoreAllMocks());

describe("image converter controls", () => {
  it("disables conversion until an image is decoded and reports invalid input", async () => {
    render(<ImageTypeConvert />);
    expect(
      screen.getByRole("button", { name: "imageConvert.convert" }),
    ).toBeDisabled();
    const input = screen.getByLabelText(/imageConvert.choose/);
    fireEvent.change(input, {
      target: { files: [new File(["x"], "file.txt", { type: "text/plain" })] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "imageConvert.errors.fileType",
    );
    fireEvent.click(screen.getByRole("button", { name: "imageConvert.reset" }));
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
