"use client";

import styles from "@/app/layout.module.css";
import { useAppSelector } from "@/store/hooks";
import { selectIsPageScrolled } from "@/store/scrollSlice";

/**
 * 머리띠의 껍데기 — 한 픽셀이라도 내려가면 판에서 떠오른다.
 *
 * 안에 드는 것(브랜드·메뉴)은 서버가 그린다. 이 조각이 브라우저의 것인 이유는
 * **떠 있는가 아닌가** 하나뿐이라, 그 하나만 가게에서 읽는다.
 */
export default function HeaderBar({ children }: { children: React.ReactNode }) {
  const isScrolled = useAppSelector(selectIsPageScrolled);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
      {children}
    </header>
  );
}
