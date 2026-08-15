import type { VercelRequest, VercelResponse } from "@vercel/node";

// Origins allowed to call any endpoint in this project. The site ships the same
// static build to two hosts (see constants/site.ts in the main repo), so both are
// listed, plus localhost for `yarn dev`.
//
// ⚠️ Add a domain here whenever the site gains one, or its widgets will fail
// there with an opaque CORS error.
export const ALLOWED_ORIGINS = [
  "https://kittipat.dev",
  "https://www.kittipat.dev",
  "https://ipondnakab.github.io",
  "http://localhost:3000",
];

export const applyCors = (
  request: VercelRequest,
  response: VercelResponse,
): void => {
  const origin = request.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Max-Age", "86400");
};

// Handles the shared preamble every endpoint needs: CORS headers, the OPTIONS
// preflight, method check, and the origin allowlist.
//
// A browser fetch always sends Origin. Rejecting unknown ones here (in addition
// to omitting the CORS header) stops non-browser clients — which ignore CORS
// entirely — from using these endpoints as a free proxy or a spam relay.
//
// Returns true when the caller should continue handling the request, false when
// a response has already been sent.
export const guardRequest = (
  request: VercelRequest,
  response: VercelResponse,
): boolean => {
  applyCors(request, response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return false;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "method_not_allowed" });
    return false;
  }

  const origin = request.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    response.status(403).json({ error: "origin_not_allowed" });
    return false;
  }

  return true;
};

// Vercel sets x-forwarded-for; the client IP is the first entry. Falls back to a
// shared bucket so a missing header degrades to a global limit rather than none.
export const clientKey = (request: VercelRequest): string => {
  const header = request.headers["x-forwarded-for"];
  const raw = Array.isArray(header) ? header[0] : header;
  return raw?.split(",")[0]?.trim() || "unknown";
};
