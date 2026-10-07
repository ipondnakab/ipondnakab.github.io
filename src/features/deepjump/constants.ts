import { DeepjumpForm } from "@/features/deepjump/model/deepjump";
export const HISTORY_KEY = "deepjump.history.v1";
export const HISTORY_LIMIT = 50;
export const DEFAULT_VALUES: DeepjumpForm = { url: "" };
export const BLOCKED_SCHEMES = new Set([
  "javascript",
  "data",
  "vbscript",
  "file",
  "blob",
  "about",
  "chrome",
  "chrome-extension",
  "filesystem",
  "view-source",
]);
