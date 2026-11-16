import ImageTypeConvert from "@/features/image-type-convert/components/ImageTypeConvert";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Image Type Convert",
  description:
    "Convert PNG, JPEG and WebP images privately in your browser. Preview, adjust quality and download without uploading your images.",
  alternates: { canonical: "/mini-project/image-type-convert" },
};
const ImageTypeConvertPage: React.FC = () => <ImageTypeConvert />;
export default ImageTypeConvertPage;
