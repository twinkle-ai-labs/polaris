"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  choiceClosed,
  choicePicked,
  choiceRegistered,
  choiceToggled,
  selectChoiceValue,
  selectIsChoiceOpen,
} from "@/store/choiceSlice";
import styles from "./Choice.module.css";

/**
 * 네이티브 `<select>` 대신 우리가 그리는 고르개. 고른 값은 숨은 input 으로 폼에 실린다.
 *
 * `id` 와 `name` 이 따로인 이유: 편집기 첫 화면에는 `defaultLocale` 이라는 **같은 이름의
 * 칸이 둘** 있다(「새 앱」의 것과 「사이트」의 것). 폼에 실릴 때는 그 이름이어야 하지만,
 * 상태를 이름으로 묶으면 한쪽을 고르는 순간 다른 쪽도 함께 바뀐다.
 */
export default function Choice({
  id,
  name,
  defaultValue,
  options,
}: {
  /** 화면에서 이 고르개 한 자리를 가리키는 이름 — 예: `newApp.defaultLocale`. */
  id: string;
  /** 폼 필드의 이름. 서버 액션이 이 이름으로 값을 받는다. */
  name: string;
  defaultValue: string;
  options: readonly { value: string; label: string }[];
}) {
  const dispatch = useAppDispatch();
  /* 아직 알리기 전에는 제 기본값으로 그린다 — 첫 그림에서 이름표가 비어 보이지 않게. */
  const value = useAppSelector(selectChoiceValue(id)) ?? defaultValue;
  const isOpen = useAppSelector(selectIsChoiceOpen(id));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(choiceRegistered({ id, value: defaultValue }));
  }, [dispatch, id, defaultValue]);

  /* 열려 있는 동안만 바깥을 듣는다 — 닫힌 목록이 문서의 모든 클릭을 붙잡고 있을 이유가 없다. */
  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) dispatch(choiceClosed(id));
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch(choiceClosed(id));
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dispatch, id, isOpen]);

  const current = options.find((option) => option.value === value);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className={styles.trigger}
        onClick={() => dispatch(choiceToggled(id))}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.value}>{current?.label ?? value}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ""}`} aria-hidden="true">
          ⌄
        </span>
      </button>

      {isOpen ? (
        <ul className={styles.menu} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isSelected ? styles.optionOn : ""}`}
                  onClick={() => dispatch(choicePicked({ id, value: option.value }))}
                >
                  {option.label}
                  {isSelected ? <span aria-hidden="true">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
