import type { IconType } from "react-icons";
import {
  GiBrain,
  GiButtonFinger,
  GiCardPlay,
  GiCrocJaws,
  GiCrown,
  GiLightningTrio,
  GiPartyPopper,
  GiVibratingSmartphone,
} from "react-icons/gi";
import { MdOutlineCasino, MdOutlineNumbers } from "react-icons/md";

export const DRUNKARD_GAME_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.ipondnakab.drunkardgame";

export const DRUNKARD_GAME_ANDROID_REDIRECT_DELAY_MS = 3000;

export interface DrunkardGameMode {
  key:
    | "headsUp"
    | "kingsCup"
    | "slotMachine"
    | "fingerChooser"
    | "secretNumber"
    | "commandCards"
    | "crocodile"
    | "shakeIt"
    | "speedTapper"
    | "theBomb";
  icon: IconType;
}

export const DRUNKARD_GAME_MODES: DrunkardGameMode[] = [
  { key: "headsUp", icon: GiBrain },
  { key: "kingsCup", icon: GiCrown },
  { key: "slotMachine", icon: MdOutlineCasino },
  { key: "fingerChooser", icon: GiButtonFinger },
  { key: "secretNumber", icon: MdOutlineNumbers },
  { key: "commandCards", icon: GiCardPlay },
  { key: "crocodile", icon: GiCrocJaws },
  { key: "shakeIt", icon: GiVibratingSmartphone },
  { key: "speedTapper", icon: GiLightningTrio },
  // { key: "theBomb", icon: GiTimeBomb,},
];

export const DRUNKARD_GAME_HIGHLIGHTS = [
  "onePhone",
  "instant",
  "partyReady",
] as const;

export const DRUNKARD_GAME_PARTY_ICON = GiPartyPopper;
