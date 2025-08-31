import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  NativeTheme,
} from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import escape from "regexp.escape";
import icon from "../../resources/icon.png?asset";
import { LanguageOption, Theme } from "../types";
import languages from "../config/languages";
import { config } from "../config";

/**
 *
 */
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle("theme:set", (_, theme: NativeTheme["themeSource"]): Theme => {
  nativeTheme.themeSource = theme;
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
});

ipcMain.handle(
  "theme:get",
  (): Theme => (nativeTheme.shouldUseDarkColors ? "dark" : "light"),
);

ipcMain.handle("search:languages", (_, query: string): LanguageOption[] => {
  const re = new RegExp(escape(query), "i");
  return languages
    .filter(
      (item) => item.id.match(re) !== null || item.label.match(re) !== null,
    )
    .sort((a, b) => {
      const matchAId = a.id.match(re);
      const matchALabel = a.label.match(re);
      const matchBId = b.id.match(re);
      const matchBLabel = b.label.match(re);

      const aIdLength = matchAId !== null ? matchAId[0].length : 0;
      const aLabelLength = matchALabel !== null ? matchALabel[0].length : 0;
      const bIdLength = matchBId !== null ? matchBId[0].length : 0;
      const bLabelLength = matchBLabel !== null ? matchBLabel[0].length : 0;

      const scoreA =
        (aIdLength / a.id.length + aLabelLength / a.label.length) / 2;
      const scoreB =
        (bIdLength / b.id.length + bLabelLength / b.label.length) / 2;

      if (scoreA > scoreB) {
        return -1;
      }

      if (scoreA < scoreB) {
        return 1;
      }

      return 0;
    })
    .slice(0, config.search.languages.limit);
});
