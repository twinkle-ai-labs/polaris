import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/**
 * 지금 화면의 언어.
 *
 * 값을 정하는 것은 **라우트**다 — 서버가 그 언어로 이미 다 그려 놓았으므로 화면은
 * 여기서 말을 꺼내 쓰지 않는다. 그래도 상태로 드는 이유는 **문서의 `lang` 속성**
 * 하나 때문이다: 정적으로 구운 HTML 은 뿌리 레이아웃 한 벌을 함께 쓰므로 처음엔 늘
 * 사이트 기본 언어로 나가고, 화면이 서면 실제 문서의 언어로 고쳐 놓아야 한다.
 * 그러지 않으면 화면 낭독기와 번역기가 **영어 약관을 한국어로 읽는다.**
 *
 * 고치는 일은 `effects` 가 한다 — 컴포넌트가 `document` 를 직접 만지지 않게.
 */
type LocaleState = { current: string };

const initialState: LocaleState = { current: "" };

const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    localeAdopted(state, action: PayloadAction<string>) {
      state.current = action.payload;
    },
  },
});

export const { localeAdopted } = localeSlice.actions;
export default localeSlice.reducer;

export const selectLocale = (state: RootState): string => state.locale.current;
