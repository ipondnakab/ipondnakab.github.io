import { RoomData } from "@/interfaces/poker";
import { Button, cn } from "@nextui-org/react";

export interface PlanningPokerGroupButtonProps {
  highlightedGroup: string;
  group: string;
  setHighlightedGroup: React.Dispatch<React.SetStateAction<string>>;
  roomData: RoomData;
}

const PlanningPokerGroupButton: React.FC<PlanningPokerGroupButtonProps> = ({
  highlightedGroup,
  group,
  setHighlightedGroup,
  roomData,
}) => {
  return (
    <Button
      variant="faded"
      className={cn(
        "cursor-pointer flex flex-row gap-2 justify-between select-none p-4 py-2 min-w-36 items-center border border-default-100",
        {
          "border-2 border-primary": highlightedGroup === group,
        },
      )}
      onPress={() =>
        setHighlightedGroup((prev) => (prev === group ? "" : group))
      }
    >
      <span className="text-xl text-primary text-center">{group}</span>
      <span className="font-bold text-xl text-center">
        {roomData.revealed
          ? Object.values(roomData.votes)
              .filter((v) => v.group === group)
              .map((v) => v.score)
              .filter((s): s is string => s !== null && !isNaN(Number(s)))
              .map(Number)
              .reduce((a, b, _, arr) => a + b / arr.length, 0)
              .toFixed(1)
          : "?"}
      </span>
    </Button>
  );
};

export default PlanningPokerGroupButton;
