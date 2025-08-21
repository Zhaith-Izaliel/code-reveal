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
