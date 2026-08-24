import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/**
 * 머리띠의 언어 고르개 — 열렸는가 닫혔는가.
 *
 * 네이티브 `<select>` 는 OS 가 그리므로 우리 디자인 시스템 밖이다. 직접 그리는 대신
 * 「열림」을 우리가 들어야 하는데, 그 하나가 여기 산다 — 바깥을 누르거나 Esc 를 눌러
 * 닫는 손은 [HeaderLocaleSelect] 가 걸고, **닫으라는 말은 액션 하나뿐**이다.
 */
type LocaleMenuState = { isOpen: boolean };

const initialState: LocaleMenuState = { isOpen: false };

const localeMenuSlice = createSlice({
  name: "localeMenu",
  initialState,
  reducers: {
    localeMenuToggled(state) {
      state.isOpen = !state.isOpen;
    },
    localeMenuClosed(state) {
      state.isOpen = false;
    },
  },
});

export const { localeMenuToggled, localeMenuClosed } = localeMenuSlice.actions;
export default localeMenuSlice.reducer;

export const selectIsLocaleMenuOpen = (state: RootState): boolean => state.localeMenu.isOpen;
