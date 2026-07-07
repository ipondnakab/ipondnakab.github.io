import "@/app/globals.css";

import type { Metadata } from "next";

import Providers from "@/app/providers";
import DefaultLayout from "@/components/layouts/DefaultLayout";

export interface RootLayoutProps {
  children: React.ReactNode;
}

const SITE_URL = "https://ipondnakab.github.io";
const SITE_TITLE = "Kittipat Daengdee | Software Engineer";
const SITE_DESCRIPTION =
  "Portfolio and playground of Kittipat Daengdee — a full-stack software engineer. Résumé, mini projects, and experiments built with Next.js, React and TypeScript.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Kittipat Daengdee",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Kittipat Daengdee",
  keywords: [
    "Kittipat Daengdee",
    "ipondnakab",
    "software engineer",
    "full stack developer",
    "frontend developer",
    "portfolio",
    "resume",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "Kittipat Daengdee", url: SITE_URL }],
  creator: "Kittipat Daengdee",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kittipat Daengdee",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/profile2.jpg",
        width: 800,
        height: 800,
        alt: "Kittipat Daengdee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/profile2.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <DefaultLayout>{children}</DefaultLayout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
