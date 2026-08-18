import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/config/site";

// Higher-priority, more frequently-crawled routes we actively promote.
const PROMOTED_ROUTES = new Set(["/planning", "/resume"]);

const ROUTES = [
  "",
  "/resume",
  "/mini-project",
  "/planning",
  "/pokdeng",
  "/mic-link",
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
    changeFrequency: PROMOTED_ROUTES.has(route) ? "weekly" : "monthly",
    priority: route === "" ? 1 : PROMOTED_ROUTES.has(route) ? 0.9 : 0.7,
  }));
}
