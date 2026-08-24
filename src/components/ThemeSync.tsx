"use client";

import { useEffect } from "react";
import { preferredTheme, readStoredTheme } from "@/lib/theme";
import { useAppDispatch } from "@/store/hooks";
import { themeAdopted } from "@/store/themeSlice";

/**
 * 브라우저가 알고 있던 얼굴을 가게에 싣는다 — 그리지는 않는다.
 *
 * 화면에 실제로 입히는 일은 `<head>` 의 한 줄(첫 그림 전)과 `store/effects`(그 뒤)가 한다.
 * 여기가 하는 일은 **Redux 가 그 사실을 알게 하는 것**뿐이다. 토글 버튼이 「지금 무엇을
 * 입고 있는가」를 화면이 아니라 상태에서 읽어야 하기 때문이다.
 */
export default function ThemeSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(themeAdopted(readStoredTheme() ?? preferredTheme()));
  }, [dispatch]);

  return null;
}
