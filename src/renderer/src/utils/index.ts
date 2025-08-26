import { ElectronTheme } from "@/types";

export async function setTheme(theme: ElectronTheme) {
  const t = await window.theme.set(theme);

  document.documentElement.classList = `app-${t}`;
}

export function indent(char: "\t" | " ", n: number): string {
  if (n < 0) {
    return "";
  }

  return char.repeat(n);
}
