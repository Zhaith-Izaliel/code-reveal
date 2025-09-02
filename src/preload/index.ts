import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { config } from "../config";
import { ElectronTheme, LanguageOption, Save, Theme } from "../types";

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("config", config);
    contextBridge.exposeInMainWorld("theme", {
      set: (theme: ElectronTheme): Promise<Theme> =>
        ipcRenderer.invoke("theme:set", theme),
      get: (): Promise<Theme> => ipcRenderer.invoke("theme:get"),
    });
    contextBridge.exposeInMainWorld("search", {
      languages: (
        query: string,
        selectedValue: string,
      ): Promise<LanguageOption[]> =>
        ipcRenderer.invoke("search:languages", query, selectedValue),
    });
    contextBridge.exposeInMainWorld("save", {
      read: async (): Promise<[Save, string]> =>
        await ipcRenderer.invoke("save:read"),
      write: async (save: Save, file = "", saveAs = false) =>
        await ipcRenderer.invoke("save:write", save, file, saveAs),
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
