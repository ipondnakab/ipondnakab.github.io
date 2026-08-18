"use client";

import { buildGroupAverage } from "@/functions/group-vote-averages";
import { RoomData, RoomStats } from "@/interfaces/poker";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoChevronDown } from "react-icons/io5";

import PlanningPokerGroupButton from "./PlanningPokerGroupButton";

export interface PlanningPokerGroupsProps {
  roomData: RoomData;
  highlightedGroup: string;
  setHighlightedGroup: React.Dispatch<React.SetStateAction<string>>;
  stats: RoomStats | null;
}

// Stands in for "no group focused". Selection keys can't be empty strings, and
// the menu disallows an empty selection so there is always a visible state.
const ALL_GROUPS_KEY = "__all";

const PlanningPokerGroups: React.FC<PlanningPokerGroupsProps> = ({
  roomData,
  highlightedGroup,
  setHighlightedGroup,
  stats,
}) => {
  const { t } = useTranslation();
  const groups = roomData.groupOptions ?? [];

  if (groups.length === 0) return null;

  const focused = groups.find((group) => group.name === highlightedGroup);

  return (
    <>
      {/* One button per group, once there is room to lay them side by side. */}
      <div className="hidden sm:flex flex-1 items-center flex-wrap justify-center gap-4">
        {groups.map((group) => (
          <PlanningPokerGroupButton
            key={group.name}
            highlightedGroup={highlightedGroup}
            group={group}
            setHighlightedGroup={setHighlightedGroup}
            roomData={roomData}
          />
        ))}
      </div>

      {/* On a phone the same buttons wrap into several rows and push the table
          off-screen, so they collapse into a single picker instead. */}
      <div className="px-4 sm:hidden">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="faded"
              className="sm:hidden flex w-full justify-between border-2 py-2"
              style={{ borderColor: focused?.color }}
              endContent={<IoChevronDown className="text-default-400" />}
            >
              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="text-lg" style={{ color: focused?.color }}>
                  {focused?.name ?? t("poker.groupFocusAll")}
                </span>
                <span className="text-lg font-bold">
                  {roomData.revealed
                    ? focused
                      ? buildGroupAverage(roomData.votes, focused.name)
                      : stats?.avg
                    : "?"}
                </span>
              </span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label={t("poker.groupFocus")}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[highlightedGroup || ALL_GROUPS_KEY]}
            onSelectionChange={(keys) => {
              const [key] =
                keys === "all" ? [ALL_GROUPS_KEY] : Array.from(keys);
              setHighlightedGroup(
                key === undefined || key === ALL_GROUPS_KEY ? "" : String(key),
              );
            }}
          >
            {[
              <DropdownItem
                key={ALL_GROUPS_KEY}
                textValue={t("poker.groupFocusAll")}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" />
                    <span className="text-default-500">
                      {t("poker.groupFocusAll")}
                    </span>
                  </span>
                  <span className="font-bold">
                    {roomData.revealed ? stats?.avg : "?"}
                  </span>
                </span>
              </DropdownItem>,
              ...groups.map((group) => (
                <DropdownItem key={group.name} textValue={group.name}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span style={{ color: group.color }}>{group.name}</span>
                    </span>
                    <span className="font-bold">
                      {roomData.revealed
                        ? buildGroupAverage(roomData.votes, group.name)
                        : "?"}
                    </span>
                  </span>
                </DropdownItem>
              )),
            ]}
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
};

export default PlanningPokerGroups;
