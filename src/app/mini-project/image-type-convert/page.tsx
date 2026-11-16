import type { Metadata } from "next";
import ImageTypeConvert from "@/features/image-type-convert/components/ImageTypeConvert";
export const metadata: Metadata = {
  title: "Image Type Convert",
  description:
    "Convert browser-readable images to PNG, JPEG, WebP, GIF, BMP, TIFF, ICO or SVG privately. Preview and download images or ZIP files without uploading.",
  alternates: { canonical: "/mini-project/image-type-convert" },
};
const ImageTypeConvertPage: React.FC = () => <ImageTypeConvert />;
export default ImageTypeConvertPage;
