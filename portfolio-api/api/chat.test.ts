import type { VercelRequest, VercelResponse } from "@vercel/node";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import handler from "./chat";

const originalApiKey = process.env.GROQ_API_KEY;
const originalFetch = globalThis.fetch;

afterEach(() => {
  process.env.GROQ_API_KEY = originalApiKey;
  globalThis.fetch = originalFetch;
});

test("sends chat completions to Groq's supported production model", async () => {
  process.env.GROQ_API_KEY = "test-key";

  let requestBody: unknown;
  globalThis.fetch = (async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return Response.json({
      choices: [{ message: { content: "Hello!" } }],
    });
  }) as typeof fetch;

  let statusCode = 0;
  let responseBody: unknown;
  const response = {
    setHeader: () => response,
    status: (code: number) => {
      statusCode = code;
      return response;
    },
    json: (body: unknown) => {
      responseBody = body;
      return response;
    },
  } as unknown as VercelResponse;
  const request = {
    method: "POST",
    headers: {
      origin: "https://kittipat.dev",
      "x-forwarded-for": "192.0.2.1",
    },
    body: { messages: [{ role: "user", content: "Hello" }] },
  } as unknown as VercelRequest;

  await handler(request, response);

  assert.equal(statusCode, 200);
  assert.deepEqual(responseBody, { reply: "Hello!" });
  assert.equal(
    (requestBody as { model?: unknown }).model,
    "openai/gpt-oss-120b",
  );
});
