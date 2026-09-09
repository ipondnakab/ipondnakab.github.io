import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_PLAYER_NAME_CHARS = 80;
const MAX_MODE_CHARS = 40;

interface DrunkardGamePayload {
  playerName: string;
  score: number;
  mode: string;
}

const SECRET_HEADER = "x-secret-key";

export const verifySecretHeader = (request: VercelRequest): boolean => {
  const secret = process.env.DRUNKARD_GAME_SECRET_KEY ?? "";
  const header = request.headers[SECRET_HEADER];
  const candidate = Array.isArray(header) ? header[0] : header;
  return (
    typeof candidate === "string" && candidate === secret && secret.length > 0
  );
};

export const parseDrunkardGamePayload = (
  body: unknown,
): DrunkardGamePayload | null => {
  if (typeof body !== "object" || body === null) return null;

  const { playerName, score, mode } = body as Record<string, unknown>;

  if (typeof playerName !== "string" || playerName.trim().length === 0)
    return null;
  if (playerName.trim().length > MAX_PLAYER_NAME_CHARS) return null;

  if (typeof score !== "number" || !Number.isFinite(score) || score < 0)
    return null;

  if (typeof mode !== "string" || mode.trim().length === 0) return null;
  if (mode.trim().length > MAX_MODE_CHARS) return null;

  return {
    playerName: playerName.trim(),
    score,
    mode: mode.trim(),
  };
};

const handler = async (
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> => {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  if (!verifySecretHeader(request)) {
    response.status(401).json({ error: "unauthorized" });
    return;
  }

  const payload = parseDrunkardGamePayload(request.body);
  if (!payload) {
    response.status(400).json({ error: "invalid_request" });
    return;
  }

  response.status(200).json({
    ok: true,
    accepted: {
      playerName: payload.playerName,
      score: payload.score,
      mode: payload.mode,
    },
  });
};

export default handler;
