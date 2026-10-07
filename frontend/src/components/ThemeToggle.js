"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-slate-200 bg-white ${className}`} />
    );
  }

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-xl transition-all border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs active:scale-95 ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-500 animate-in fade-in" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 animate-in fade-in" />
      )}
    </button>
  );
}
