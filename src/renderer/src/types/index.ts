import { INSERT, EQUAL, DELETE } from "fast-diff";

export type Mode = "normal" | "preview" | "autoplay";

export type ModeOption = {
  label: string;
  value: Mode;
  disabled: boolean;
  icon: string;
};

export enum ActionType {
  Noop,
  PreviewNext,
  PreviewPrev,
}

export type Actions = Map<ActionType, () => void>;

export type CodeDiff = {
  code: string;
  highlightedCode: string;
  op: typeof INSERT | typeof EQUAL | typeof DELETE;
  isNewLine: boolean;
};

export type DiffAnimationPrimitive = {
  el: string;
  id: string;
  op: typeof INSERT | typeof EQUAL | typeof DELETE;

  opacity?: {
    from: number;
    to: number;
  };

  top?: {
    from: number;
    to: number;
  };

  left?: {
    from: number;
    to: number;
  };
};
