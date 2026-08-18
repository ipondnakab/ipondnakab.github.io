import { RoomData } from "@/interfaces/poker";
import { Button, Card, Divider } from "@nextui-org/react";
import { IoCafeOutline, IoSettingsOutline } from "react-icons/io5";

export interface PlanningPokerCardSelectionProps {
  activeDeck: string[];
  roomData: RoomData | null;
  userId: string;
  handleVote: (value: string) => void;
  onClickSettings: () => void;
}

const PlanningPokerCardSelection: React.FC<PlanningPokerCardSelectionProps> = ({
  activeDeck,
  roomData,
  userId,
  handleVote,
  onClickSettings,
}) => {
  return (
    <div className="sticky bottom-6 z-50">
      <Card
        isBlurred
        className="px-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-sm"
      >
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
          <Button
            isIconOnly
            variant="flat"
            color="primary"
            onPress={onClickSettings}
            className="min-w-[48px] h-12 rounded-xl shadow-sm"
          >
            <IoSettingsOutline size={20} />
          </Button>
          <Divider orientation="vertical" className="h-8" />
          <div className="flex gap-3 py-4 flex-1 justify-center">
            {activeDeck.map((val) => {
              const isSelected = roomData?.votes?.[userId]?.score === val;
              return (
                <Button
                  key={val}
                  variant={isSelected ? "solid" : "flat"}
                  color={isSelected ? "primary" : "default"}
                  className={`min-w-[56px] h-16 text-xl font-black rounded-2xl transition-all
                      ${isSelected ? "-translate-y-4 shadow-xl scale-110" : "hover:-translate-y-2"}
                    `}
                  onPress={() => handleVote(val)}
                >
                  {val === "☕" ? <IoCafeOutline size={24} /> : val}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PlanningPokerCardSelection;
