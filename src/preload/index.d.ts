import { NativeTheme } from "electron";
import { ElectronAPI } from "@electron-toolkit/preload";
import { AppConfig } from "../config";
import { Theme, ElectronTheme } from "../types";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    config: AppConfig;
    theme: {
      set: (theme: ElectronTheme) => Promise<Theme>;
      get: () => Promise<Theme>;
    };
  }
}
