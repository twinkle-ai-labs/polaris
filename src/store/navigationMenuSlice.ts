import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/** 좁은 화면의 탐색 메뉴. 언어 메뉴와 동시에 열리지 않도록 effects에서 조정한다. */
const navigationMenuSlice = createSlice({
  name: "navigationMenu",
  initialState: { isOpen: false },
  reducers: {
    navigationMenuToggled(state) {
      state.isOpen = !state.isOpen;
    },
    navigationMenuClosed(state) {
      state.isOpen = false;
    },
  },
});

export const { navigationMenuToggled, navigationMenuClosed } = navigationMenuSlice.actions;
export default navigationMenuSlice.reducer;
export const selectIsNavigationMenuOpen = (state: RootState): boolean => state.navigationMenu.isOpen;
