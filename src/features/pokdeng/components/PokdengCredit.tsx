"use client";

import { Spinner, useDisclosure } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  POKDENG_DEFAULT_MULTIPLIER,
  POKDENG_MAX_PLAYERS,
  POKDENG_NAME_MAX_LENGTH,
} from "@/features/pokdeng/constants";
import {
  createPokdengGame,
  createPokdengPlayer,
  isPokdengPlayerActive,
  pokdengHostCredit,
  pokdengPickAmount,
  resetPokdengCredits,
  setPokdengPlayerStatus,
  settlePokdengTurn,
  undoPokdengTurn,
} from "@/features/pokdeng/lib/credit";
import {
  clearPokdengGame,
  loadPokdengGame,
  savePokdengGame,
} from "@/features/pokdeng/lib/storage";
import {
  PokdengGame,
  PokdengOutcome,
  PokdengPicks,
  PokdengPlayerStatus,
} from "@/features/pokdeng/model/pokdeng";
import { trackEvent } from "@/shared/lib/analytics";
import PokdengHeader from "./PokdengHeader";
import PokdengHistoryModal from "./PokdengHistoryModal";
import PokdengHostCard from "./PokdengHostCard";
import PokdengPlayerCard from "./PokdengPlayerCard";
import PokdengPlayersModal from "./PokdengPlayersModal";
import PokdengResetModal from "./PokdengResetModal";
import PokdengSettingsModal from "./PokdengSettingsModal";
import PokdengSettleBar from "./PokdengSettleBar";
import PokdengSetup from "./PokdengSetup";

const PokdengCredit: React.FC = () => {
  const { t } = useTranslation();
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onOpenChange: onHistoryOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPlayersOpen,
    onOpen: onPlayersOpen,
    onOpenChange: onPlayersOpenChange,
  } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onOpenChange: onSettingsOpenChange,
  } = useDisclosure();
  const {
    isOpen: isResetOpen,
    onOpen: onResetOpen,
    onOpenChange: onResetOpenChange,
  } = useDisclosure();

  const [game, setGame] = useState<PokdengGame | null>(null);
  // The turn being settled, held as two independent maps: which side a player
  // is on, and which deng they are on. Keeping the deng separate is what lets
  // every card show its multipliers before a side has been picked — a player
  // only counts towards the turn once they appear in `outcomes`.
  const [outcomes, setOutcomes] = useState<Record<string, PokdengOutcome>>({});
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // localStorage is only readable after mount, so the first client render must
  // match the prerendered HTML (a spinner) before the saved game appears.
  useEffect(() => {
    setGame(loadPokdengGame());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading || !game) return;
    savePokdengGame(game);
  }, [game, loading]);

  const hostCredit = useMemo(
    () => (game ? pokdengHostCredit(game.players) : 0),
    [game],
  );

  // The settle-ready view of the two maps: only players who have been put on a
  // side, each carrying whichever deng is currently selected for them.
  const picks: PokdengPicks = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(outcomes).map(([playerId, outcome]) => [
          playerId,
          {
            outcome,
            multiplier: multipliers[playerId] ?? POKDENG_DEFAULT_MULTIPLIER,
          },
        ]),
      ),
    [outcomes, multipliers],
  );

  // The host is the mirror of the table, so their pending swing is the negated
  // sum of every pick currently on the board.
  const pendingHostAmount = useMemo(() => {
    if (!game) return 0;
    return (
      -game.players.reduce((sum, player) => {
        const pick = picks[player.id];
        if (!pick) return sum;
        return sum + pokdengPickAmount(game.bet, pick.outcome, pick.multiplier);
      }, 0) || 0
    );
  }, [game, picks]);

  const pickCount = Object.keys(outcomes).length;
  // Seats still in play. Paused and departed players stay on the board with
  // their balance, but they are not who the turn is being dealt to.
  const activePlayerCount =
    game?.players.filter(isPokdengPlayerActive).length ?? 0;

  const clearPicks = () => {
    setOutcomes({});
    setMultipliers({});
  };

  const handleStart = (
    hostName: string,
    bet: number,
    playerNames: string[],
  ) => {
    void trackEvent("pokdeng_start_game", {
      player_count: playerNames.length,
      bet,
    });
    setGame(createPokdengGame(hostName, bet, playerNames));
    clearPicks();
  };

  // Tapping the side a player is already on takes them out of the turn, so a
  // mis-tap is undone with the same button rather than a separate control. The
  // deng survives that, ready for whichever side is picked next.
  const pickOutcome = (playerId: string, outcome: PokdengOutcome) =>
    setOutcomes((current) => {
      if (current[playerId] === outcome) {
        const { [playerId]: _cleared, ...rest } = current;
        return rest;
      }
      return { ...current, [playerId]: outcome };
    });

  // Selectable whether or not the player is on a side yet.
  const pickMultiplier = (playerId: string, multiplier: number) =>
    setMultipliers((current) => ({ ...current, [playerId]: multiplier }));

  // Sweeps only reach the seats still in play — a paused or departed player is
  // not "all" of anything.
  const pickAll = (outcome: PokdengOutcome) => {
    if (!game) return;
    setOutcomes(
      Object.fromEntries(
        game.players
          .filter(isPokdengPlayerActive)
          .map((player) => [player.id, outcome]),
      ),
    );
  };

  // Stepping out of play drops any pick the player was carrying, so they can
  // never be settled on a side they are no longer taking part in.
  const setPlayerStatus = (playerId: string, status: PokdengPlayerStatus) => {
    setGame((current) =>
      current ? setPokdengPlayerStatus(current, playerId, status) : current,
    );
    if (status === "active") return;
    setOutcomes((current) => {
      const { [playerId]: _cleared, ...rest } = current;
      return rest;
    });
  };

  const settleTurn = () => {
    if (!game || pickCount === 0) return;
    void trackEvent("pokdeng_settle_turn", {
      picked: pickCount,
      player_count: game.players.length,
      bet: game.bet,
    });
    setGame(settlePokdengTurn(game, picks));
    // Each hand is dealt fresh, so the deng resets to x1 along with the sides.
    clearPicks();
  };

  const undoTurn = () => {
    if (!game || game.turns.length === 0) return;
    void trackEvent("pokdeng_undo_turn", { turn: game.turns[0].index });
    setGame(undoPokdengTurn(game));
  };

  const addPlayer = (name: string) =>
    setGame((current) => {
      if (!current || current.players.length >= POKDENG_MAX_PLAYERS) {
        return current;
      }
      return {
        ...current,
        players: [
          ...current.players,
          createPokdengPlayer(name.slice(0, POKDENG_NAME_MAX_LENGTH)),
        ],
      };
    });

  const renamePlayer = (playerId: string, name: string) =>
    setGame((current) => {
      if (!current) return current;
      return {
        ...current,
        players: current.players.map((player) =>
          player.id === playerId ? { ...player, name } : player,
        ),
      };
    });

  // Removing a player drops their balance off the table, which is what settling
  // up and leaving means — the host's derived credit shrinks to match.
  const removePlayer = (playerId: string) => {
    setGame((current) => {
      if (!current) return current;
      return {
        ...current,
        players: current.players.filter((player) => player.id !== playerId),
      };
    });
    setOutcomes((current) => {
      const { [playerId]: _removedOutcome, ...rest } = current;
      return rest;
    });
    setMultipliers((current) => {
      const { [playerId]: _removedMultiplier, ...rest } = current;
      return rest;
    });
  };

  const saveSettings = (hostName: string, bet: number) =>
    setGame((current) => (current ? { ...current, hostName, bet } : current));

  const handleResetCredits = () => {
    void trackEvent("pokdeng_reset_credits", { turns: game?.turnCount ?? 0 });
    setGame((current) => (current ? resetPokdengCredits(current) : current));
    clearPicks();
  };

  const handleNewGame = () => {
    void trackEvent("pokdeng_new_game", { turns: game?.turnCount ?? 0 });
    clearPokdengGame();
    setGame(null);
    clearPicks();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!game) return <PokdengSetup onStart={handleStart} />;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 px-4 py-2 sm:gap-3 md:px-8">
      <PokdengHeader
        bet={game.bet}
        turnCount={game.turnCount}
        playerCount={activePlayerCount}
        historyCount={game.turns.length}
        canUndo={game.turns.length > 0}
        onUndo={undoTurn}
        onOpenHistory={onHistoryOpen}
        onOpenPlayers={onPlayersOpen}
        onOpenSettings={onSettingsOpen}
        onReset={onResetOpen}
      />

      <PokdengHostCard
        hostName={game.hostName}
        hostCredit={hostCredit}
        pendingHostAmount={pendingHostAmount}
      />

      {game.players.length === 0 ? (
        <p className="py-10 text-center text-sm text-default-500">
          {t("pokdeng.noPlayers")}
        </p>
      ) : (
        // `items-start` keeps each card at its natural height — a card without
        // a pick must not stretch to match a taller neighbour's extra row.
        <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {game.players.map((player) => (
            <PokdengPlayerCard
              key={player.id}
              player={player}
              bet={game.bet}
              outcome={outcomes[player.id]}
              multiplier={multipliers[player.id] ?? POKDENG_DEFAULT_MULTIPLIER}
              onPickOutcome={pickOutcome}
              onPickMultiplier={pickMultiplier}
              onSetStatus={setPlayerStatus}
              onEdit={onPlayersOpen}
            />
          ))}
        </div>
      )}

      {/* Nothing to settle when every seat is paused or has cashed out. */}
      {activePlayerCount > 0 && (
        <PokdengSettleBar
          pickCount={pickCount}
          pendingHostAmount={pendingHostAmount}
          onPickAll={pickAll}
          onClearPicks={clearPicks}
          onSettle={settleTurn}
        />
      )}

      <PokdengHistoryModal
        isOpen={isHistoryOpen}
        onOpenChange={onHistoryOpenChange}
        turns={game.turns}
        hostName={game.hostName}
        onUndo={undoTurn}
      />

      <PokdengPlayersModal
        isOpen={isPlayersOpen}
        onOpenChange={onPlayersOpenChange}
        players={game.players}
        onAddPlayer={addPlayer}
        onRenamePlayer={renamePlayer}
        onRemovePlayer={removePlayer}
      />

      <PokdengSettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={onSettingsOpenChange}
        hostName={game.hostName}
        bet={game.bet}
        onSave={saveSettings}
      />

      <PokdengResetModal
        isOpen={isResetOpen}
        onOpenChange={onResetOpenChange}
        onResetCredits={handleResetCredits}
        onNewGame={handleNewGame}
      />
    </div>
  );
};

export default PokdengCredit;
