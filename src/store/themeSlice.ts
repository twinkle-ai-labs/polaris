import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Theme } from "@/lib/theme";
import type { RootState } from "./index";

/**
 * 화면의 얼굴 — 라이트와 다크.
 *
 * 셋째 값(«시스템을 따름»)을 두지 않는다. 그건 상태가 아니라 **처음 한 번의 답**이라서,
 * 상태로 두면 화면마다 «지금 무엇을 그려야 하는가»를 다시 계산해야 한다.
 * 기기의 취향은 [themeAdopted] 가 들어올 때 이미 둘 중 하나로 정해져 온다.
 */
type ThemeState = {
  /** 지금 입고 있는 얼굴. */
  current: Theme;
  /**
   * 브라우저에서 실제 값을 읽어 왔는가.
   * 정적으로 구워진 HTML 은 늘 light 로 서므로, 읽기 전의 `current` 는 «아직 모른다»는 뜻이다.
   */
  isAdopted: boolean;
};

const initialState: ThemeState = { current: "light", isAdopted: false };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    /**
     * 브라우저가 이미 알고 있던 얼굴을 그대로 입는다.
     * **고른 것이 아니므로 다시 적어 두지 않는다** — 기기의 취향을 쿠키에 베껴 두면
     * 나중에 그 취향이 바뀌어도 우리 화면만 옛 얼굴에 붙잡힌다.
     */
    themeAdopted(state, action: PayloadAction<Theme>) {
      state.current = action.payload;
      state.isAdopted = true;
    },
    /** 사용자가 눌렀다 — 이건 선택이라 쿠키에 남는다(쓰는 일은 `effects` 가 한다). */
    themeToggled(state) {
      state.current = state.current === "dark" ? "light" : "dark";
      state.isAdopted = true;
    },
  },
});

export const { themeAdopted, themeToggled } = themeSlice.actions;
export default themeSlice.reducer;

export const selectTheme = (state: RootState): Theme => state.theme.current;
export const selectIsDarkTheme = (state: RootState): boolean => state.theme.current === "dark";
