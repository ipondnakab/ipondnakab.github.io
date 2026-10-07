export interface JumpHistoryEntry {
  url: string;
  jumpedAt: number;
}
export interface DeepjumpForm {
  url: string;
}

export interface DeleteHistoryAction {
  kind: "delete";
  url: string;
}
export interface ClearHistoryAction {
  kind: "clear";
}
export type HistoryAction = DeleteHistoryAction | ClearHistoryAction;
