import {
  DEFAULT_THEME,
  STORAGE_KEYS
} from "./constants.js";


export function loadTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.theme) === "light"
      ? "light"
      : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}


export function saveTheme(theme) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.theme,
      theme
    );

    return true;
  } catch {
    return false;
  }
}
