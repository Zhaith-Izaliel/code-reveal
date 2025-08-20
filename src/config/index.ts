import { SlideData, Theme } from "../types";
import { v4 as uuidv4 } from "uuid";

export type AppConfig = {
  preview: {
    width: number;
    height: number;
    skipAutoScale: boolean;
    backgroundColor: (theme: Theme) => string;
    cacheBust: boolean;
    delay: number;
  };

  slides: {
    defaultSlide: SlideData;
    indent: {
      number: number;
      character: " " | "\t";
    };
  };
};

export const config: AppConfig = {
  slides: {
    defaultSlide: {
      id: uuidv4(),
      color: "2B7FFF",
      fileName: "code.example",
      code: "",
      preview: "",
    },

    indent: {
      number: 2,
      character: " ",
    },
  },
  preview: {
    width: 800,
    height: 500,
    skipAutoScale: true,
    cacheBust: true,
    backgroundColor: (theme: Theme) =>
      theme === "dark" ? "#050505" : "#FEFEFE",

    delay: 200,
  },
};
