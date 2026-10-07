"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {}, mounted: false });
const THEME_EVENT = "taskflow-theme-change";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function readTheme() {
  try {
    return localStorage.getItem("taskflow_theme") === "dark" ? "dark" : "light";
  } catch {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }
}

const serverTheme = () => "light";
const clientMounted = () => true;
const serverMounted = () => false;

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const mounted = useSyncExternalStore(subscribe, clientMounted, serverMounted);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try {
      localStorage.setItem("taskflow_theme", nextTheme);
    } catch {
      // The document still reflects the selected theme when storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
