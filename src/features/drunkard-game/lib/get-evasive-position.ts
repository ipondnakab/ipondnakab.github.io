import {
  EvasivePoint,
  EvasivePositionInput,
} from "@/features/drunkard-game/model/evasive-button";

const distanceSquared = (first: EvasivePoint, second: EvasivePoint) => {
  const deltaX = first.x - second.x;
  const deltaY = first.y - second.y;
  return deltaX * deltaX + deltaY * deltaY;
};

export const getEvasivePosition = ({
  pointer,
  container,
  button,
  padding = 0,
}: EvasivePositionInput): EvasivePoint => {
  const maxX = Math.max(0, container.width - button.width - padding);
  const maxY = Math.max(0, container.height - button.height - padding);
  const minX = Math.min(padding, maxX);
  const minY = Math.min(padding, maxY);
  const candidates: EvasivePoint[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: minX, y: maxY },
    { x: maxX, y: maxY },
  ];

  return candidates.reduce((farthest, candidate) => {
    const candidateCenter = {
      x: candidate.x + button.width / 2,
      y: candidate.y + button.height / 2,
    };
    const farthestCenter = {
      x: farthest.x + button.width / 2,
      y: farthest.y + button.height / 2,
    };

    return distanceSquared(pointer, candidateCenter) >
      distanceSquared(pointer, farthestCenter)
      ? candidate
      : farthest;
  });
};
