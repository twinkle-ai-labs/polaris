"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsDarkTheme, themeToggled } from "@/store/themeSlice";
import styles from "./ThemeToggle.module.css";

/**
 * 얼굴을 뒤집는 버튼.
 *
 * 이름표는 **지금 무엇을 입고 있는지가 아니라 누르면 무엇이 되는지**를 말한다 —
 * 어두운 화면에서 「어두운 화면」이라고 적힌 버튼은 무엇을 하는 물건인지 알 수 없다.
 */
export default function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectIsDarkTheme);
  const label = isDark ? toLight : toDark;

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => dispatch(themeToggled())}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon} aria-hidden="true">
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
