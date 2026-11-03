import {
  MASCOT_ACTIONS,
  MASCOT_HOVER_REST_MAX_MS,
  MASCOT_HOVER_REST_MIN_MS,
  MASCOT_HOVER_REST_TICKS,
  MASCOT_HOVER_ROLL_LOOP_END,
  MASCOT_HOVER_ROLL_LOOP_START,
} from "@/features/chat/constants";

export const getNextHoverRollTick = (
  tick: number,
  hovered: boolean,
): number => {
  const index = tick % MASCOT_ACTIONS.roll.frames.length;
  return hovered && index === MASCOT_HOVER_ROLL_LOOP_END
    ? MASCOT_HOVER_ROLL_LOOP_START
    : index + 1;
};

const unitRandom = (random: number): number =>
  Number.isFinite(random) ? Math.max(0, Math.min(1, random)) : 0;

export const chooseHoverRollRestTick = (random: number): number =>
  MASCOT_HOVER_REST_TICKS[
    Math.min(
      MASCOT_HOVER_REST_TICKS.length - 1,
      Math.floor(unitRandom(random) * MASCOT_HOVER_REST_TICKS.length),
    )
  ];

export const getHoverRollRestDelay = (random: number): number =>
  MASCOT_HOVER_REST_MIN_MS +
  Math.round(
    unitRandom(random) * (MASCOT_HOVER_REST_MAX_MS - MASCOT_HOVER_REST_MIN_MS),
  );
