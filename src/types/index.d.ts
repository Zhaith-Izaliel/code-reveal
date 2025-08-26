import { NativeTheme } from "electron";
import Prism from "prismjs";

export type Theme = "dark" | "light";

export type ElectronTheme = NativeTheme["themeSource"];

export type PrismData = {
  grammar: Prism.Grammar;
  name: string;
};

export type SlideData = {
  code: string;
  thumbnail: string;
};

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
