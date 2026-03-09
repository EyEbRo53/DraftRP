import { writable } from "svelte/store";

/**
 * Theme store — manages light/dark mode with cookie persistence.
 *
 * Reads the theme from the "theme" cookie on init.
 * Falls back to OS preference if no cookie is set.
 */

function getInitialTheme() {
  // 1. Check cookie
  const match = document.cookie.match(/(?:^|;\s*)theme=(light|dark)/);
  if (match) return match[1];

  // 2. OS preference
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function persistTheme(theme) {
  // Cookie expires in 1 year
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `theme=${theme};path=/;max-age=${maxAge};SameSite=Lax`;
}

const initial = getInitialTheme();
applyTheme(initial);

export const theme = writable(initial);

/** Toggle between light and dark */
export function toggleTheme() {
  theme.update((current) => {
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    persistTheme(next);
    return next;
  });
}

/** Set a specific theme */
export function setTheme(newTheme) {
  applyTheme(newTheme);
  persistTheme(newTheme);
  theme.set(newTheme);
}
