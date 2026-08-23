"use client";

import { useDispatch, useSelector } from "react-redux";
import { persistTheme, setTheme, type AppDispatch, type RootState } from "@/store/theme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme.value);

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    dispatch(setTheme(next));
    persistTheme(next);
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
