import "@/app/globals.css";

import type { Metadata } from "next";

import Providers from "@/app/providers";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import StructuredData from "@/components/seo/StructuredData";

export interface RootLayoutProps {
  children: React.ReactNode;
}

const SITE_URL = "https://ipondnakab.github.io";
const SITE_TITLE = "Kittipat Daengdee — Full-Stack Software Engineer";
const SITE_DESCRIPTION =
  "Kittipat Daengdee (ipondnakab) is a full-stack software engineer specializing in React, Next.js, TypeScript, Node.js and Spring Boot. Explore the résumé, projects and experiments.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Kittipat Daengdee",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Kittipat Daengdee",
  keywords: [
    "Kittipat",
    "Kittipat Daengdee",
    "ipondnakab",
    "software engineer",
    "full stack engineer",
    "full stack developer",
    "full-stack software engineer",
    "frontend engineer",
    "frontend developer",
    "software developer",
    "React developer",
    "Next.js developer",
    "web developer",
    "portfolio",
    "resume",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
  ],
  authors: [{ name: "Kittipat Daengdee", url: SITE_URL }],
  creator: "Kittipat Daengdee",
  publisher: "Kittipat Daengdee",
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
        <StructuredData />
        <Providers>
          <DefaultLayout>{children}</DefaultLayout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
