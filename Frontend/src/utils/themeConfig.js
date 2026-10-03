/**
 * CANONICAL DECKLE THEMES
 * Single source of truth for themes across Header, Catalog, Book Details, and Reader.
 */

export const THEME_STORAGE_KEY = "deckle_theme";

export const DECKLE_THEMES = [
  {
    id: "parchment",
    name: "Parchment",
    desc: "Warm Paper",
    color: "#fdf9f0",
    border: "#d6c3b7",
    textColor: "#1c1c16",
    isDark: false,
  },
  {
    id: "crisp-paper",
    name: "Crisp Paper",
    desc: "Daylight Clean",
    color: "#ffffff",
    border: "#cbd5e1",
    textColor: "#1e293b",
    isDark: false,
  },
  {
    id: "soft-sage",
    name: "Soft Sage",
    desc: "Eye Care Green",
    color: "#ebf1ea",
    border: "#b8c8b7",
    textColor: "#233527",
    isDark: false,
  },
  {
    id: "nocturne",
    name: "Nocturne",
    desc: "Slate Twilight",
    color: "#191e24",
    border: "#374353",
    textColor: "#cbd5e1",
    isDark: true,
  },
  {
    id: "midnight",
    name: "Midnight",
    desc: "OLED Night",
    color: "#0b0c0e",
    border: "#282c34",
    textColor: "#e2e8f0",
    isDark: true,
  },
];

export function getActiveTheme() {
  if (typeof window === "undefined") return "parchment";
  return localStorage.getItem(THEME_STORAGE_KEY) || "parchment";
}

export function applyTheme(themeId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
  document.documentElement.setAttribute("data-theme", themeId);
  window.dispatchEvent(new CustomEvent("deckle_theme_change", { detail: themeId }));
}
