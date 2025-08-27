import { INSERT, EQUAL, DELETE } from "fast-diff";
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

export type AnimationPrimitives = {
  el: string;
  id: string;
  op: typeof INSERT | typeof EQUAL | typeof DELETE;

  top: number;
  left: number;

  to?: {
    top: number;
    left: number;
  };
};
