"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

function getThemeCookie(): Theme | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )twinkle-theme=([^;]*)/);
  if (match) {
    const val = decodeURIComponent(match[1]);
    if (val === "dark" || val === "light") return val;
  }
  return null;
}

function setThemeCookie(val: Theme) {
  if (typeof document === "undefined") return;
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1";
  const domain = isLocal ? "" : "; domain=.twinklelabs.kr";
  document.cookie = `twinkle-theme=${val}${domain}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem("twinkle-theme", val);
    localStorage.setItem("polaris-theme", val);
  } catch {}
}

export default function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const cookieTheme = getThemeCookie();
    if (cookieTheme) {
      setTheme(cookieTheme);
      return;
    }
    try {
      const saved = localStorage.getItem("twinkle-theme") || localStorage.getItem("polaris-theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        setThemeCookie(saved);
        return;
      }
    } catch {}
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  function flip() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    setThemeCookie(next);
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={flip}
      aria-label={theme === "dark" ? toLight : toDark}
      title={theme === "dark" ? toLight : toDark}
    >
      <span className={styles.icon} aria-hidden="true">
        {theme === "dark" ? "☾" : "☀"}
      </span>
    </button>
  );
}
