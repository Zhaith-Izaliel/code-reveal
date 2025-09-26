import fastDiff from "fast-diff";

export type Mode = "normal" | "preview";

export type ModeOption = {
  label: string;
  value: Mode;
  disabled: boolean;
  icon: string;
  description: string;
};

export enum ActionType {
  Noop,
  PreviewNext,
  PreviewPrev,
}

export type Actions = Map<ActionType, () => void>;

export const FINAL = 2;
export const FINAL_CODE = 3;
export const INSERT = fastDiff.INSERT;
export const DELETE = fastDiff.DELETE;
export const EQUAL = fastDiff.EQUAL;

export type CodeDiff = {
  code: string;
  highlightedCode: string;
  op: typeof INSERT | typeof EQUAL | typeof DELETE;
  isNewLine: boolean;
};

export type PrimitiveOp =
  | typeof INSERT
  | typeof EQUAL
  | typeof DELETE
  | typeof FINAL
  | typeof FINAL_CODE;

export type SlideDiff = {
  diffs: CodeDiff[];
  finalCode: string;
};

export type DiffAnimationPrimitive = {
  el?: string;
  id: string;
  op: PrimitiveOp;

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
