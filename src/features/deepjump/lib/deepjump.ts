import { BLOCKED_SCHEMES, HISTORY_LIMIT } from "@/features/deepjump/constants";
import { JumpHistoryEntry } from "@/features/deepjump/model/deepjump";

export const validateDeeplink = (input: string): string | null => {
  if (/[\u0000-\u001f\u007f]/.test(input)) return null;
  const url = input.trim();
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(url)?.[1].toLowerCase();
  if (!scheme || BLOCKED_SCHEMES.has(scheme) || /\s/.test(url)) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  if (!url.slice(scheme.length + 1).replace(/\//g, "")) return null;
  if (scheme === "intent") {
    const intentScheme = /#Intent;(?:.*;)?scheme=([a-z][a-z\d+.-]*);/i
      .exec(url)?.[1]
      .toLowerCase();
    if (
      !intentScheme ||
      BLOCKED_SCHEMES.has(intentScheme) ||
      !url.endsWith(";end")
    )
      return null;
  }
  return url;
};

export const addToHistory = (
  history: JumpHistoryEntry[],
  url: string,
  jumpedAt: number,
): JumpHistoryEntry[] =>
  [{ url, jumpedAt }, ...history.filter((entry) => entry.url !== url)].slice(
    0,
    HISTORY_LIMIT,
  );

export const parseHistory = (stored: string | null): JumpHistoryEntry[] => {
  try {
    const data: unknown = JSON.parse(stored ?? "[]");
    if (!Array.isArray(data)) return [];
    const entries: JumpHistoryEntry[] = [];
    for (const value of data) {
      if (
        typeof value !== "object" ||
        value === null ||
        !("url" in value) ||
        !("jumpedAt" in value)
      )
        continue;
      if (
        typeof value.url !== "string" ||
        validateDeeplink(value.url) !== value.url ||
        typeof value.jumpedAt !== "number" ||
        !Number.isFinite(value.jumpedAt) ||
        value.jumpedAt < 0
      )
        continue;
      entries.push({ url: value.url, jumpedAt: value.jumpedAt });
    }
    return entries
      .sort((a, b) => b.jumpedAt - a.jumpedAt)
      .filter(
        (entry, index, all) =>
          all.findIndex((item) => item.url === entry.url) === index,
      )
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
};
