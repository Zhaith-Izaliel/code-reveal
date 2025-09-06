import {
  dialog,
  FileFilter,
  OpenDialogOptions,
  SaveDialogOptions,
  IpcMainInvokeEvent,
} from "electron";
import { isLeft } from "fp-ts/lib/Either";
import { Save, TSave } from "../types";
import { PathReporter } from "io-ts/lib/PathReporter";
import { readFileSync, writeFile } from "fs";

const filters: FileFilter[] = [
  { name: "JSON", extensions: ["json"] },
  { name: "All Files", extensions: ["*"] },
];

async function saveDialog(defaultPath?: string): Promise<string> {
  const dialogOptions: SaveDialogOptions = {
    defaultPath,
    filters,
    properties: ["showOverwriteConfirmation", "createDirectory"],
  };

  const result = await dialog.showSaveDialog(dialogOptions);

  if (result.canceled || result.filePath.length === 0) {
    throw Error("No file has been selected");
  }

  return result.filePath;
}

async function openDialog(): Promise<string[]> {
  const dialogOptions: OpenDialogOptions = {
    filters,
    properties: ["openFile", "createDirectory"],
  };

  const result = await dialog.showOpenDialog(dialogOptions);
  if (result.canceled || result.filePaths.length === 0) {
    throw Error("No file has been selected");
  }

  return result.filePaths;
}

export async function saveRead(): Promise<[Save, string]> {
  const files: string[] = await openDialog();

  if (!files[0]) {
    throw Error("No file has been selected");
  }

  const buffer = readFileSync(files[0]);
  const decoded = TSave.decode(JSON.parse(buffer.toString()));
  if (isLeft(decoded)) {
    throw Error(`Could not validate the file ${files[0]}`);
  }

  return [decoded.right, files[0]];
}

export async function saveWrite(
  _: IpcMainInvokeEvent,
  save: Save,
  file = "",
  saveAs = false,
) {
  const decoded = TSave.decode(save);

  if (file === "" || saveAs) {
    file = await saveDialog(file);
  }

  if (isLeft(decoded)) {
    throw Error(
      `Could not validate data: ${PathReporter.report(decoded).join("\n")}`,
    );
  }
  const decodedSave = decoded.right;
  writeFile(file, JSON.stringify(decodedSave), (err) => {
    if (err) throw err;
  });
}
