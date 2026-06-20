import { GroupObject, RoomData } from "@/interfaces/poker";
import { Button, cn } from "@nextui-org/react";

export interface PlanningPokerGroupButtonProps {
  highlightedGroup: string;
  group: GroupObject;
  setHighlightedGroup: React.Dispatch<React.SetStateAction<string>>;
  roomData: RoomData;
}

const PlanningPokerGroupButton: React.FC<PlanningPokerGroupButtonProps> = ({
  highlightedGroup,
  group,
  setHighlightedGroup,
  roomData,
}) => {
  const isHighlighted = highlightedGroup === group.name;
  return (
    <Button
      variant="faded"
      style={{ borderColor: group.color }}
      className={cn(
        `cursor-pointer flex flex-row gap-2 justify-between select-none p-4 py-2 min-w-36 items-center border-0`,
        {
          "border-2": isHighlighted,
        },
      )}
      onPress={() =>
        setHighlightedGroup((prev) => (prev === group.name ? "" : group.name))
      }
    >
      <span className="text-xl text-center" style={{ color: group.color }}>
        {group.name}
      </span>
      <span className="font-bold text-xl text-center">
        {roomData.revealed
          ? Object.values(roomData.votes)
              .filter((v) => v.group === group.name)
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
