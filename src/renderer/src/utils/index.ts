import { ElectronTheme } from "@/types";

export const setTheme = async (theme: ElectronTheme) => {
  const t = await window.theme.set(theme);

  const root = document.querySelector(":root");
  if (root?.hasAttribute("data-theme")) {
    root.setAttribute("data-theme", t);
  }

  localStorage.theme = t;
};
