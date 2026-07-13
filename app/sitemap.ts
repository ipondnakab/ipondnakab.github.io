import type { MetadataRoute } from "next";

const SITE_URL = "https://ipondnakab.github.io";

const ROUTES = [
  "",
  "/mini-project",
  "/planning",
  "/prompt-pay",
  "/threejs",
  "/credit",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
