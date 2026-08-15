// Local development server.
//
// `vercel dev` resolves its project by walking up the directory tree, so from
// this folder it finds the repository-root .vercel link (which registers the
// main site) and serves the Next.js app instead of this function. Rather than
// fight that resolution, this script imports the handler directly and serves it
// over plain node:http.
//
// Node 22.6+ strips TypeScript types natively, so this runs without a build
// step or any dependency: `yarn dev` (see package.json).
//
// This is a development convenience only — production always runs the handler
// through Vercel's own runtime. The shim below implements just the slice of the
// VercelRequest/VercelResponse surface that api/chat.ts actually uses; if the
// handler starts using more of it (req.query, req.cookies, res.redirect), extend
// this accordingly.

import type { IncomingMessage } from "node:http";
import { createServer } from "node:http";

import type { VercelRequest, VercelResponse } from "@vercel/node";

import chatHandler from "./api/chat";
import contactHandler from "./api/contact";

// Mirrors Vercel's file-based routing: api/<name>.ts is served at /api/<name>.
const ROUTES: Record<
  string,
  (request: VercelRequest, response: VercelResponse) => Promise<void>
> = {
  "/api/chat": chatHandler,
  "/api/contact": contactHandler,
};

const PORT = Number(process.env.PORT ?? 3001);
const MAX_BODY_BYTES = 100_000;

const readBody = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      // Without a cap, a large upload would buffer unbounded in memory.
      if (raw.length > MAX_BODY_BYTES) {
        reject(new Error("request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(raw));
    request.on("error", reject);
  });

const server = createServer(async (request, response) => {
  const path = (request.url ?? "").split("?")[0];
  const handler = ROUTES[path];
  if (!handler) {
    response.statusCode = 404;
    response.end(`Not found. Available: ${Object.keys(ROUTES).join(", ")}`);
    return;
  }

  // Vercel parses JSON bodies before the handler runs; mirror that here.
  let body: unknown = undefined;
  if (request.method === "POST") {
    try {
      const raw = await readBody(request);
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      response.statusCode = 400;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "invalid_body" }));
      return;
    }
  }

  // In production Vercel sets this; locally derive it from the socket so the
  // rate limiter buckets per client rather than lumping everything together.
  request.headers["x-forwarded-for"] ??=
    request.socket.remoteAddress ?? "local";

  const vercelRequest = Object.assign(request, {
    body,
  }) as unknown as VercelRequest;

  const vercelResponse = Object.assign(response, {
    status(code: number) {
      response.statusCode = code;
      return vercelResponse;
    },
    json(payload: unknown) {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(payload));
      return vercelResponse;
    },
  }) as unknown as VercelResponse;

  try {
    await handler(vercelRequest, vercelResponse);
  } catch (error) {
    console.error("Handler threw:", error);
    if (!response.writableEnded) {
      response.statusCode = 500;
      response.end();
    }
  }
});

server.listen(PORT, () => {
  const state = (name: string) => (process.env[name] ? "set" : "MISSING");
  console.log(`portfolio-api dev server → http://localhost:${PORT}`);
  for (const path of Object.keys(ROUTES)) console.log(`  ${path}`);
  console.log(
    `GROQ_API_KEY: ${state("GROQ_API_KEY")}  ` +
      `LINE_CHANNEL_ACCESS_TOKEN: ${state("LINE_CHANNEL_ACCESS_TOKEN")}  ` +
      `LINE_USER_ID: ${state("LINE_USER_ID")}`,
  );
});
