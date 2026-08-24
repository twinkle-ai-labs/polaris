"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localeSwappedPath } from "@/lib/site";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  localeMenuClosed,
  localeMenuToggled,
  selectIsLocaleMenuOpen,
} from "@/store/localeMenuSlice";
import styles from "./HeaderLocaleSelect.module.css";

/**
 * 언어 고르개.
 *
 * 네이티브 `<select>` 는 OS 가 그리므로 우리 디자인 시스템 밖이다 — 그래서 직접 그린다.
 * 「지금 무슨 언어인가」는 **라우트가 정한다**(서버가 이미 그 언어로 그려 놓았다).
 * 가게가 드는 것은 열렸는가 하나뿐이다.
 */

/** 나라 깃발 — 언어의 얼굴. 목록을 눈으로 훑을 때 글자보다 먼저 걸린다. */
const FLAGS: Record<string, string> = {
  ko: "/flags/kr.png",
  en: "/flags/us.png",
  ja: "/flags/jp.png",
  "zh-CN": "/flags/cn.png",
  "zh-TW": "/flags/tw.png",
  es: "/flags/es.png",
  de: "/flags/de.png",
  fr: "/flags/fr.png",
  it: "/flags/it.png",
  "pt-BR": "/flags/br.png",
  id: "/flags/id.png",
};

export default function HeaderLocaleSelect({
  locales,
  current,
  defaultLocale,
  label,
}: {
  locales: readonly { value: string; label: string }[];
  current: string;
  defaultLocale: string;
  label: string;
}) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsLocaleMenuOpen);
  const router = useRouter();
  const pathname = usePathname();
  const selected = locales.find((locale) => locale.value === current) ?? locales[0];
  /* 「바깥」이 어디까지인지는 DOM 만 안다 — 클래스 이름으로 견주면 스타일을 손보는 날 조용히 어긋난다. */
  const wrapRef = useRef<HTMLDivElement>(null);

  /* 열려 있는 동안만 바깥을 듣는다 — 닫힌 목록이 문서의 모든 클릭을 붙잡고 있을 이유가 없다. */
  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) dispatch(localeMenuClosed());
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch(localeMenuClosed());
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dispatch, isOpen]);

  function onPick(locale: string) {
    dispatch(localeMenuClosed());
    if (locale === current) return;
    /* 읽던 자리를 지키며 언어만 갈아 끼운다 — 홈으로 튕기면 다시 찾아 들어가야 한다. */
    router.push(
      localeSwappedPath(
        pathname,
        locale,
        defaultLocale,
        locales.map((item) => item.value),
      ),
    );
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => dispatch(localeMenuToggled())}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Image className={styles.flag} src={FLAGS[selected.value]} alt="" width={20} height={14} />
        <span className={styles.current}>{selected.label}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="m3 4.75 3 3 3-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className={styles.menu}>
          <div className={styles.menuScroll} role="listbox" aria-label={label}>
            {locales.map((locale) => {
              const isSelected = locale.value === current;
              return (
                <button
                  key={locale.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isSelected ? styles.optionActive : ""}`}
                  onClick={() => onPick(locale.value)}
                >
                  <Image
                    className={styles.flag}
                    src={FLAGS[locale.value]}
                    alt=""
                    width={20}
                    height={14}
                  />
                  <span>{locale.label}</span>
                  {isSelected ? (
                    <span className={styles.check} aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
