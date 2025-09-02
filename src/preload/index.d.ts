import { NativeTheme } from "electron";
import { ElectronAPI } from "@electron-toolkit/preload";
import { AppConfig } from "../config";
import { Theme, ElectronTheme, LanguageOption, Save } from "../types";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    config: AppConfig;
    theme: {
      set: (theme: ElectronTheme) => Promise<Theme>;
      get: () => Promise<Theme>;
    };
    search: {
      languages: (
        query: string,
        selectedValue: string,
      ) => Promise<LanguageOption[]>;
    };
    save: {
      read: () => Promise<[Save, string]>;
      write: (save: Save, file = "", saveAs = false) => Promise<void>;
    };
  }
}
