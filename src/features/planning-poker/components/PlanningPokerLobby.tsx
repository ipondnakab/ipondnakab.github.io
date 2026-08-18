"use client";

import { RoomData } from "@/interfaces/poker";
import { Button, Card, Chip, Divider, Input, Spinner } from "@nextui-org/react";
import { useTranslation } from "react-i18next";

export interface PlanningPokerLobbyProps {
  roomId: string | null;
  loading: boolean;
  roomData: RoomData | null;
  userGroup?: string;
  wasKicked?: boolean;
  setUserGroup: (group: string) => void;
  setUserName: (name: string) => void;
  handleJoin: () => void;
}

const PlanningPokerLobby: React.FC<PlanningPokerLobbyProps> = ({
  roomId,
  loading,
  roomData,
  userGroup,
  wasKicked = false,
  setUserGroup,
  setUserName,
  handleJoin,
}) => {
  const { t } = useTranslation();
  return (
    <div className=" flex items-center justify-center p-8 py-16 h-[calc(100vh-4rem)]">
      {!roomId ? (
        <Card isBlurred className="max-w-md w-full p-8 gap-4 shadow-xl">
          <h2 className="text-xl font-bold self-center">
            {t("poker.welcome")}
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
                {t("poker.startNewGame")}
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
                <span>{t("poker.or")}</span>
                <Input
                  name="roomId"
                  variant="bordered"
                  placeholder={t("poker.enterRoomId")}
                  onKeyDown={(e) =>
                    e.key === "Enter" && e.currentTarget.form?.requestSubmit()
                  }
                />
                <Button color="primary" type="submit">
                  {t("poker.joinGame")}
                </Button>
              </form>
            </>
          )}
        </Card>
      ) : (
        <Card isBlurred className="max-w-md w-full p-8 gap-4 shadow-xl">
          {wasKicked && (
            <Chip
              variant="flat"
              color="danger"
              className="self-center max-w-full h-auto py-2 text-center whitespace-normal"
            >
              {t("poker.kickedNotice")}
            </Chip>
          )}
          <h2 className="text-xl font-bold">{t("poker.yourName")}</h2>
          <Input
            variant="bordered"
            placeholder={t("poker.enterName")}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          {roomData?.groupOptions && roomData?.groupOptions?.length > 0 && (
            <>
              <h2 className="text-xl font-bold">{t("poker.selectGroup")}</h2>
              <div className="flex flex-wrap gap-2">
                {roomData.groupOptions.map((group) => {
                  const isSelected = userGroup === group.name;
                  return (
                    <Chip
                      key={group.name}
                      variant={isSelected ? "solid" : "bordered"}
                      style={
                        isSelected
                          ? { backgroundColor: group.color, color: "#fff" }
                          : { borderColor: group.color, color: group.color }
                      }
                      onClick={() =>
                        isSelected ? setUserGroup("") : setUserGroup(group.name)
                      }
                      className="cursor-pointer select-none"
                    >
                      {group.name}
                    </Chip>
                  );
                })}
              </div>
            </>
          )}
          <Button color="primary" onPress={() => handleJoin()}>
            {t("poker.joinTable")}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PlanningPokerLobby;
