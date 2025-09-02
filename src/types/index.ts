import { NativeTheme } from "electron";
import { EaseStringParamNames } from "animejs";
import * as t from "io-ts";
import { TSlideData } from "./generated";

export type Theme = "dark" | "light";

export type ElectronTheme = NativeTheme["themeSource"];

export type SlideData = {
  code: string;
  thumbnail: string;
  animations: {
    move: {
      duration: number;
      ease: EaseStringParamNames;
    };
    fade: {
      duration: number;
      ease: EaseStringParamNames;
    };
  };
};

export type EasingOption = {
  value: EaseStringParamNames;
  label: string;
};

export type LanguageOption = {
  value: string;
  label: string;
};

export const TSave = t.type({
  fileName: t.string,
  color: t.string,
  slides: t.array(TSlideData),
  language: t.string,
  indent: t.number,
});

export type Save = t.TypeOf<typeof TSave>;

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

  animations: {
    fade: {
      minDuration: number;
      maxDuration: number;
    };
    move: {
      minDuration: number;
      maxDuration: number;
    };
  };

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
