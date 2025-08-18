import Prism from "prismjs";

export type SlideData = {
  language: {
    grammar: Prism.Grammar;
    name: string;
  };

  color: string;
  fileName: string;
  code: string;
};
