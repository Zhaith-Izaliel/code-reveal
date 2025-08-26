import { ElectronTheme } from "@/types";
import Prism from "prismjs";

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

export function generateHighlightedCode(
  code: string,
  language: string,
  grammar: Prism.Grammar,
): string {
  if (code === "") {
    return "";
  }

  return Prism.highlight(code, grammar, language);
}
