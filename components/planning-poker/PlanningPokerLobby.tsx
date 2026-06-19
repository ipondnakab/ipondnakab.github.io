import { RoomData } from "@/interfaces/poker";
import { Button, Card, Chip, Divider, Input, Spinner } from "@nextui-org/react";

export interface PlanningPokerLobbyProps {
  roomId: string | null;
  loading: boolean;
  roomData: RoomData | null;
  userGroup?: string;
  setUserGroup: (group: string) => void;
  setUserName: (name: string) => void;
  handleJoin: () => void;
}

const PlanningPokerLobby: React.FC<PlanningPokerLobbyProps> = ({
  roomId,
  loading,
  roomData,
  userGroup,
  setUserGroup,
  setUserName,
  handleJoin,
}) => {
  return (
    <div className=" flex items-center justify-center p-8 py-16 h-[calc(100vh-4rem)]">
      {!roomId ? (
        <Card isBlurred className="max-w-sm w-full p-8 gap-4 shadow-xl">
          <h2 className="text-xl font-bold self-center">
            Welcome to Planning Poker
          </h2>
          {loading ? (
            <Spinner size="lg" className="mx-auto" />
          ) : (
            <>
              <Button
                color="primary"
                size="lg"
                onPress={() =>
                  (window.location.search = `?room=${Math.random().toString(36).substring(7)}`)
                }
              >
                Start New Game
              </Button>
              <Divider />

              <form
                className="flex flex-row items-center gap-4 pl-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const id = formData.get("roomId")?.toString().trim();
                  if (id) {
                    window.location.search = `?room=${id}`;
                  }
                }}
              >
                <span>Or</span>
                <Input
                  name="roomId"
                  variant="bordered"
                  placeholder="Enter Room ID to Join"
                  onKeyDown={(e) =>
                    e.key === "Enter" && e.currentTarget.form?.requestSubmit()
                  }
                />
                <Button color="primary" type="submit">
                  Join Game
                </Button>
              </form>
            </>
          )}
        </Card>
      ) : (
        <Card isBlurred className="max-w-sm w-full p-8 gap-4 shadow-xl">
          <h2 className="text-xl font-bold">Your Name</h2>
          <Input
            variant="bordered"
            placeholder="Enter name..."
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          {roomData?.groups && roomData?.groups?.length > 0 && (
            <>
              <h2 className="text-xl font-bold">Select Group</h2>
              <div className="flex flex-wrap gap-2">
                {roomData.groups.map((group) => (
                  <Chip
                    key={group}
                    variant={userGroup === group ? "solid" : "flat"}
                    color="primary"
                    onClick={() =>
                      group === userGroup
                        ? setUserGroup("")
                        : setUserGroup(group)
                    }
                    className="cursor-pointer select-none"
                  >
                    {group}
                  </Chip>
                ))}
              </div>
            </>
          )}
          <Button color="primary" onPress={() => handleJoin()}>
            Join Table
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PlanningPokerLobby;
