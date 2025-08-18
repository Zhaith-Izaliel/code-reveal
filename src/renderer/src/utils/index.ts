/**
 * Change the current theme of the application.
 * @param theme - the theme to change to
 */
export function changeTheme(theme: "dark" | "light" | "os") {
  if (theme === "os") {
    localStorage.removeItem("theme");
  } else {
    localStorage.theme = theme;
  }

  const root = document.querySelector("html");
  if (root?.hasAttribute("data-theme")) {
    root.setAttribute("data-theme", localStorage.theme);
  }
}

/**
 * returns the currently theme
 * @returns the currently selected theme
 */
export function currentTheme(): "dark" | "light" {
  return localStorage.theme;
}
