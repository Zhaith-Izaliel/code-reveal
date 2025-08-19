import { Theme } from "@/types";
import { computed } from "vue";
import { setTheme as utilsSetTheme } from "@renderer/utils";

export function useTheme() {
  const theme = computed((): Theme => {
    return localStorage.theme;
  });

  const setTheme = async (theme: Theme) => {
    await utilsSetTheme(theme);
  };

  return {
    theme,
    setTheme,
  };
}
