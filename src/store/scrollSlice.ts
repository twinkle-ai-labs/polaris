import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/**
 * 스크롤 — **한 번 재고 여럿이 읽는다.**
 *
 * 실제 값은 [ScrollSync] 하나가 싣고, 「머리띠가 떠야 하는가」 같은 판단은
 * **선택자가 한다**. 기준이 한 줄로 남아야 다음 사람이 고칠 자리를 찾을 수 있다.
 */
type ScrollState = {
  /** 문서가 얼마나 내려갔는가(px). */
  offset: number;
  /** 창의 높이(px). 「한 화면쯤 내려갔다」를 세려면 이것이 함께 있어야 한다. */
  viewportHeight: number;
};

const initialState: ScrollState = { offset: 0, viewportHeight: 0 };

const scrollSlice = createSlice({
  name: "scroll",
  initialState,
  reducers: {
    scrollChanged(state, action: PayloadAction<ScrollState>) {
      state.offset = action.payload.offset;
      state.viewportHeight = action.payload.viewportHeight;
    },
  },
});

export const { scrollChanged } = scrollSlice.actions;
export default scrollSlice.reducer;

/** 머리띠가 판에서 떠올라야 하는가 — 한 픽셀만 내려가도 그렇다. */
export const selectIsPageScrolled = (state: RootState): boolean => state.scroll.offset > 0;
