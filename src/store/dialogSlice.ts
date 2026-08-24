import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/**
 * 확인창 — **한 번에 하나만** 열린다.
 *
 * `confirm()` 은 OS 가 그리므로 우리 화면 밖이다. 대신 우리가 그리는데, 그러면
 * 「지금 열린 창」을 누군가 들어야 한다. 열린 것의 id 하나만 두면 둘이 겹쳐 뜨는 일이
 * 아예 생기지 않는다 — 창마다 불리언을 두면 그 겹침은 언젠가 실제로 일어난다.
 */
type DialogState = { openDialogId: string | null };

const initialState: DialogState = { openDialogId: null };

const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    dialogOpened(state, action: PayloadAction<string>) {
      state.openDialogId = action.payload;
    },
    dialogClosed(state) {
      state.openDialogId = null;
    },
  },
});

export const { dialogOpened, dialogClosed } = dialogSlice.actions;
export default dialogSlice.reducer;

export const selectIsDialogOpen = (id: string) => (state: RootState): boolean =>
  state.dialog.openDialogId === id;
