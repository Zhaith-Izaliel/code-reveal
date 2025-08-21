import { SlideData, Theme } from "../types";

export type AppThumbnailConfig = {
  width: number;
  height: number;
  skipAutoScale: boolean;
  backgroundColor: (theme: Theme) => string;
  cacheBust: boolean;
  delay: number;
};

export type AppConfig = {
  thumbnail: AppThumbnailConfig;

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
      code: "",
      thumbnail: "",
    },

    indent: {
      number: 2,
      character: " ",
    },
  },
  thumbnail: {
    width: 800,
    height: 500,
    skipAutoScale: true,
    cacheBust: true,
    backgroundColor: (theme: Theme) =>
      theme === "dark" ? "#050505" : "#FEFEFE",

    delay: 200,
  },
};
