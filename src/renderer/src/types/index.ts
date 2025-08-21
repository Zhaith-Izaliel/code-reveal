import { DiffEntry } from "util";

export enum Mode {
  Normal,
  Preview,
}

export enum ActionType {
  Noop,
  PreviewNext,
  PreviewPrev,
}

export type Actions = Map<ActionType, () => void>;

export type CodeDiff = {
  code: DiffEntry[];
  highlightedCode: DiffEntry[];
};
