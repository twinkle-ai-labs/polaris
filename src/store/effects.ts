import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { applyTheme, writeStoredTheme } from "@/lib/theme";
import { localeAdopted, selectLocale } from "./localeSlice";
import { selectTheme, themeAdopted, themeToggled } from "./themeSlice";
import type { AppDispatch, RootState } from "./index";

/**
 * 부수효과가 사는 한 곳.
 *
 * 리듀서는 순수해야 하고 컴포넌트는 `document` 를 몰라야 한다 — 그 둘 사이에 남는 일
 * (쿠키를 적고, 화면에 얼굴을 입히고, 문서의 언어를 고쳐 놓는 일)이 여기 모인다.
 * 예전에는 토글 버튼이 「상태를 바꾸는 호출」과 「쿠키를 적는 호출」을 나란히 불렀는데,
 * 그러면 **다른 자리에서 테마를 바꾸는 날 한쪽을 빼먹는다.** 이제 바꾸는 길은 액션 하나뿐이다.
 */
export const listenerMiddleware = createListenerMiddleware();

const startListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

/* ── 테마 ───────────────────────────────────────────────────── */

/** 얼굴이 바뀌면 언제나 화면에 입힌다 — 처음 읽어 왔든, 눌러서 바꿨든. */
startListening({
  matcher: isAnyOf(themeAdopted, themeToggled),
  effect: (_action, api) => applyTheme(selectTheme(api.getState())),
});

/** **고른 것만** 남긴다. 기기의 취향을 그대로 적으면 취향이 바뀌어도 따라가지 못한다. */
startListening({
  actionCreator: themeToggled,
  effect: (_action, api) => writeStoredTheme(selectTheme(api.getState())),
});

/* ── 언어 ───────────────────────────────────────────────────── */

/**
 * 문서의 언어를 `<html lang>` 에 옮겨 적는다.
 *
 * 정적으로 구운 HTML 은 뿌리 레이아웃 한 벌을 함께 쓰므로 처음엔 사이트 기본 언어로 나간다.
 * 고쳐 놓지 않으면 화면 낭독기와 번역기가 **영어 약관을 한국어로 읽는다.**
 * (본문 자체는 `<article lang>` 이 이미 정확하다 — 여기서 고치는 것은 문서 전체의 이름표다.)
 */
startListening({
  actionCreator: localeAdopted,
  effect: (_action, api) => {
    const locale = selectLocale(api.getState());
    if (locale) document.documentElement.lang = locale;
  },
});
