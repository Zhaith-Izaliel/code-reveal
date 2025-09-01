import { NativeTheme } from "electron";
import { EasingParam } from "animejs";
import Prism from "prismjs";

export type Theme = "dark" | "light";

export type ElectronTheme = NativeTheme["themeSource"];

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

export type LanguageOption = {
  id: string;
  label: string;
};

export type Save = {
  fileName: string;
  color: string;
  slides: SlideData[];
  language: string;
  indent: number;
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
    indent: number;
    language: LanguageOption;
    fileName: string;
    color: string;
  };

  search: {
    languages: {
      limit: number;
      delay: number;
    };
  };
};
