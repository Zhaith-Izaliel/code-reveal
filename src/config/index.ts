import { SlideData, Theme } from "../types";

export type AppConfig = {
  preview: {
    width: number;
    height: number;
    skipAutoScale: boolean;
    backgroundColor: (theme: Theme) => string;
    cacheBust: boolean;
    throttle: number;
  };

  slides: {
    defaultSlide: SlideData;
  };
};

export const config: AppConfig = {
  slides: {
    defaultSlide: {
      color: "#2B7FFF",
      fileName: "code.example",
      code: "",
    },
  },
  preview: {
    width: 800,
    height: 500,
    skipAutoScale: true,
    cacheBust: true,
    backgroundColor: (theme: Theme) =>
      theme === "dark" ? "#050505" : "#FEFEFE",

    throttle: 2000,
  },
};
