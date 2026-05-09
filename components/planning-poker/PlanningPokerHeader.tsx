import { RoomData } from "@/interfaces/poker";
import { Button, Card, Chip } from "@nextui-org/react";
import { IoEye, IoEyeOff, IoPeople, IoRefresh } from "react-icons/io5";

export interface PlanningPokerHeaderProps {
  roomData: RoomData | null;
  toggleReveal: () => void;
  resetRound: () => void;
}

const PlanningPokerHeader: React.FC<PlanningPokerHeaderProps> = ({
  roomData,
  toggleReveal,
  resetRound,
}) => {
  return (
    <Card
      isBlurred
      className="flex flex-row justify-between items-center p-4 rounded-3xl shadow-sm"
    >
      <div className="flex gap-2 items-center">
        <Chip
          size="lg"
          variant="flat"
          color="primary"
          startContent={<IoPeople className="ml-1" />}
        >
          {Object.keys(roomData?.votes || {}).length} Players
        </Chip>
        <span className="md:inline hidden text-[12px]">
          Let&apos;s estimate this together 🚀
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          onPress={resetRound}
          startContent={<IoRefresh />}
        >
          Reset
        </Button>
        <Button
          size="sm"
          color="primary"
          className="font-bold"
          onPress={toggleReveal}
          startContent={roomData?.revealed ? <IoEyeOff /> : <IoEye />}
        >
          {roomData?.revealed ? "Hide" : "Reveal"}
        </Button>
      </div>
    </Card>
  );
};

export default PlanningPokerHeader;
