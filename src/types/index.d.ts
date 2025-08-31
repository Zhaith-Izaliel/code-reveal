import { NativeTheme } from "electron";
import { EasingParam } from "animejs";
import Prism from "prismjs";

export type Theme = "dark" | "light";

export type ElectronTheme = NativeTheme["themeSource"];

export type PrismData = {
  grammar: Prism.Grammar;
  name: string;
};

export type Indent = {
  number: number;
  character: " " | "\t";
};

export type SlideData = {
  code: string;
  thumbnail: string;
  animations: {
    move: {
      duration: number;
      ease: EasingParam;
    };
    fade: {
      duration: number;
      ease: EasingParam;
    };
  };
};

export type Save = {
  fileName: string;
  color: string;
  slides: SlideData[];
  language: string;
  indent: Indent;
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

  default: {
    slide: SlideData;
    indent: Indent;
    language: string;
    fileName: string;
    color: string;
  };
};
