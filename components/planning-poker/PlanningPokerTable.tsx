import { RoomData } from "@/interfaces/poker";
import { Card, Chip, cn } from "@nextui-org/react";
import { IoHelpOutline, IoPencil } from "react-icons/io5";

export interface PlanningPokerTableProps {
  roomData: RoomData | null;
  userId: string | null;
  userName: string;
  userGroup: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  setTempGroup: React.Dispatch<React.SetStateAction<string>>;
  onRenameOpen: () => void;
  highlightedGroup: string;
}
const PlanningPokerTable: React.FC<PlanningPokerTableProps> = ({
  roomData,
  userId,
  userName,
  userGroup,
  setTempName,
  setTempGroup,
  onRenameOpen,
  highlightedGroup,
}) => {
  return (
    <Card
      isBlurred
      className="flex-1 min-h-[340px] p-4 flex items-center justify-center shadow-sm"
    >
      <div className="w-full h-full flex flex-wrap items-center justify-center gap-8">
        {Object.entries(roomData?.votes || {})
          .sort(([uidA], [uidB]) => uidA.localeCompare(uidB))
          .map(([uid, data]) => {
            const hasVoted = data.score !== null;
            const isRevealed = roomData?.revealed;
            const isMe = uid === userId;

            return (
              <div
                key={uid}
                className={cn(
                  "flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300",
                  {
                    "opacity-25":
                      highlightedGroup && data.group !== highlightedGroup,
                  },
                )}
              >
                <div className={"perspective-1000 w-16 h-24 sm:w-24 sm:h-32"}>
                  <div
                    className={cn(
                      `relative w-full h-full transition-transform duration-700 preserve-3d `,
                      {
                        "rotate-y-180": isRevealed,
                      },
                    )}
                  >
                    <div
                      className={`absolute inset-0 backface-hidden rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg transition-all
                        ${hasVoted ? "bg-primary border-primary text-white scale-105" : "border-primary text-primary"}
                      `}
                    >
                      {roomData?.groups &&
                        roomData.groups.length > 0 &&
                        data.group &&
                        roomData.groups.includes(data.group) && (
                          <Chip
                            size="sm"
                            variant="solid"
                            color="primary"
                            className={cn(
                              "absolute top-2  text-white rounded-full",
                              {
                                "opacity-0": !data.group,
                              },
                            )}
                          >
                            <div className="max-w-14 truncate">
                              {data.group}
                            </div>
                          </Chip>
                        )}
                      {hasVoted ? (
                        <span className="font-black sm:text-[20px] italic">
                          READY
                        </span>
                      ) : (
                        <IoHelpOutline size={32} />
                      )}
                    </div>
                    <Card className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-4 border-primary flex items-center justify-center shadow-xl bg-primary">
                      {roomData?.groups &&
                        roomData.groups.length > 0 &&
                        data.group &&
                        roomData.groups.includes(data.group) && (
                          <Chip
                            size="sm"
                            variant="solid"
                            color="primary"
                            className={cn(
                              "absolute top-2  text-white rounded-full",
                              {
                                "opacity-0": !data.group,
                              },
                            )}
                          >
                            <div className="max-w-14 truncate">
                              {data.group}
                            </div>
                          </Chip>
                        )}
                      <div
                        className={cn({
                          "w-5 aspect-square rounded-full bg-white overflow-hidden":
                            !isRevealed,
                        })}
                      >
                        <div
                          className={cn(
                            "text-white text-3xl max-w-20 truncate font-black",
                            {
                              hidden: !isRevealed,
                              "text-2xl": String(data.score).length > 3,
                              "text-xl": String(data.score).length > 4,
                              "text-medium": String(data.score).length > 5,
                            },
                          )}
                        >
                          {(isRevealed ? data.score : "ไม่บอกหรอก!") || "☕"}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                <div
                  className={`flex sm:max-w-24 max-w-16 items-center gap-1 group rounded-lg px-2 py-1 ${isMe ? "bg-primary text-white cursor-pointer" : "bg-default-100 text-default-600"}`}
                  onClick={() => {
                    if (!isMe) return;
                    setTempName(userName);
                    setTempGroup(userGroup);
                    onRenameOpen();
                  }}
                >
                  <span
                    className={`text-[12px] flex-1 font-black transition-colors truncate`}
                  >
                    {data.name.toUpperCase()}
                  </span>
                  {isMe && <IoPencil size={12} />}
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
};

export default PlanningPokerTable;
