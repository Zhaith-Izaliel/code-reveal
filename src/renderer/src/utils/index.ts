import { ElectronTheme } from "@/types";

export const setTheme = async (theme: ElectronTheme) => {
  const t = await window.theme.set(theme);

  document.documentElement.classList.toggle(`app-${t}`);
  localStorage.theme = t;
};
