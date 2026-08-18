"use client";

import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAdd, IoTrashOutline } from "react-icons/io5";

import {
  POKDENG_MAX_PLAYERS,
  POKDENG_NAME_MAX_LENGTH,
} from "@/features/pokdeng/constants";
import { formatPokdengCredit } from "@/features/pokdeng/lib/credit";
import { PokdengPlayer } from "@/features/pokdeng/model/pokdeng";

export interface PokdengPlayersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  players: PokdengPlayer[];
  onAddPlayer: (name: string) => void;
  onRenamePlayer: (playerId: string, name: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

const PokdengPlayersModal: React.FC<PokdengPlayersModalProps> = ({
  isOpen,
  onOpenChange,
  players,
  onAddPlayer,
  onRenamePlayer,
  onRemovePlayer,
}) => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState<string>("");
  // Names are edited as drafts and committed on blur, so a half-typed name is
  // never written back as the player's real name (and can't be left empty).
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setDrafts(
      Object.fromEntries(players.map((player) => [player.id, player.name])),
    );
    setNewName("");
    // Re-seeding on every `players` change would fight the user's typing; the
    // drafts only need to be synced when the modal is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const commitName = (player: PokdengPlayer) => {
    const name = (drafts[player.id] ?? "").trim();
    if (!name || name === player.name) {
      setDrafts((current) => ({ ...current, [player.id]: player.name }));
      return;
    }
    onRenamePlayer(player.id, name.slice(0, POKDENG_NAME_MAX_LENGTH));
  };

  const addPlayer = () => {
    const name = newName.trim().slice(0, POKDENG_NAME_MAX_LENGTH);
    if (!name || players.length >= POKDENG_MAX_PLAYERS) return;
    onAddPlayer(name);
    setNewName("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span>{t("pokdeng.managePlayers")}</span>
              <span className="text-xs font-normal text-default-500">
                {t("pokdeng.managePlayersHint")}
              </span>
            </ModalHeader>
            <ModalBody className="gap-3">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-2">
                  <Input
                    size="sm"
                    variant="bordered"
                    aria-label={t("pokdeng.playerNameAria", {
                      name: player.name,
                    })}
                    value={drafts[player.id] ?? ""}
                    maxLength={POKDENG_NAME_MAX_LENGTH}
                    onValueChange={(value) =>
                      setDrafts((current) => ({
                        ...current,
                        [player.id]: value,
                      }))
                    }
                    onBlur={() => commitName(player)}
                  />
                  <span className="w-16 shrink-0 text-right text-sm font-bold tabular-nums">
                    {formatPokdengCredit(player.credit)}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    aria-label={t("pokdeng.removePlayer", {
                      name: player.name,
                    })}
                    onPress={() => onRemovePlayer(player.id)}
                  >
                    <IoTrashOutline />
                  </Button>
                </div>
              ))}

              <Divider />

              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addPlayer();
                }}
              >
                <Input
                  size="sm"
                  variant="bordered"
                  placeholder={t("pokdeng.playerNamePlaceholder")}
                  value={newName}
                  maxLength={POKDENG_NAME_MAX_LENGTH}
                  isDisabled={players.length >= POKDENG_MAX_PLAYERS}
                  onValueChange={setNewName}
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  type="submit"
                  aria-label={t("pokdeng.addPlayer")}
                  isDisabled={
                    newName.trim() === "" ||
                    players.length >= POKDENG_MAX_PLAYERS
                  }
                >
                  <IoAdd size={18} />
                </Button>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                {t("pokdeng.done")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PokdengPlayersModal;
