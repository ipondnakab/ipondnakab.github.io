import {
  MASCOT_AMBIENT_ACTIONS,
  MASCOT_AMBIENT_MAX_MS,
  MASCOT_AMBIENT_MIN_MS,
  MASCOT_GROOM_MAX_MS,
  MASCOT_GROOM_MIN_MS,
} from "@/features/chat/constants";
import type {
  MascotAction,
  MascotAmbientAction,
  MascotState,
} from "@/features/chat/model/mascot";

const unitRandom = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

export const chooseMascotAmbientAction = (
  random: number,
  previous: MascotAmbientAction | null,
): MascotAmbientAction => {
  const choices = MASCOT_AMBIENT_ACTIONS.filter(
    (action) => action !== previous,
  );
  const index = Math.min(
    choices.length - 1,
    Math.floor(unitRandom(random) * choices.length),
  );
  return choices[index];
};

export const getMascotAmbientDelay = (random: number): number =>
  MASCOT_AMBIENT_MIN_MS +
  Math.round(
    unitRandom(random) * (MASCOT_AMBIENT_MAX_MS - MASCOT_AMBIENT_MIN_MS),
  );

export const getMascotGroomDelay = (random: number): number =>
  MASCOT_GROOM_MIN_MS +
  Math.round(unitRandom(random) * (MASCOT_GROOM_MAX_MS - MASCOT_GROOM_MIN_MS));

export const resolveMascotAction = (
  state: MascotState,
  ambient: MascotAmbientAction | null,
  reducedMotion: boolean,
): MascotAction => {
  if (reducedMotion) return "sit";
  if (state === "walking") return "walk";
  if (state === "thinking") return "groom";
  if (state === "replying") return "expression";
  return ambient ?? "sit";
};
