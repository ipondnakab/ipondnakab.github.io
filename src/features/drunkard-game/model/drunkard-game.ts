import type { IconType } from "react-icons";

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
