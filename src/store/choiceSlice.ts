import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/**
 * 편집기의 고르개들 — 한 화면에 여럿이 선다.
 *
 * 네이티브 `<select>` 는 OS 가 그리므로 우리 디자인 시스템 밖이다. 직접 그리는 대신
 * 고른 값과 열림을 여기서 든다.
 *
 * **열쇠는 폼의 이름(`name`)이 아니라 자리의 이름(`id`)이다.** 편집기 첫 화면에는
 * `defaultLocale` 이라는 같은 이름의 칸이 둘 있다 — 「새 앱」의 것과 「사이트」의 것.
 * 이름으로 묶으면 한쪽을 고르는 순간 다른 쪽도 함께 바뀐다.
 */
type ChoiceField = { value: string; isOpen: boolean };
type ChoiceState = { fields: Record<string, ChoiceField> };

const initialState: ChoiceState = { fields: {} };

const choiceSlice = createSlice({
  name: "choice",
  initialState,
  reducers: {
    /** 화면에 선 고르개가 제 자리와 첫 값을 알린다. */
    choiceRegistered(state, action: PayloadAction<{ id: string; value: string }>) {
      state.fields[action.payload.id] = { value: action.payload.value, isOpen: false };
    },
    choiceToggled(state, action: PayloadAction<string>) {
      const field = state.fields[action.payload];
      if (field) field.isOpen = !field.isOpen;
    },
    choiceClosed(state, action: PayloadAction<string>) {
      const field = state.fields[action.payload];
      if (field) field.isOpen = false;
    },
    /** 고르면 곧바로 닫힌다 — 고른 뒤에도 열려 있는 목록은 「덜 고른 것」처럼 보인다. */
    choicePicked(state, action: PayloadAction<{ id: string; value: string }>) {
      state.fields[action.payload.id] = { value: action.payload.value, isOpen: false };
    },
  },
});

export const { choiceRegistered, choiceToggled, choiceClosed, choicePicked } = choiceSlice.actions;
export default choiceSlice.reducer;

/** 아직 알리기 전이면 `undefined` — 부르는 쪽이 제 기본값으로 받는다(첫 그림이 비지 않게). */
export const selectChoiceValue = (id: string) => (state: RootState): string | undefined =>
  state.choice.fields[id]?.value;

export const selectIsChoiceOpen = (id: string) => (state: RootState): boolean =>
  state.choice.fields[id]?.isOpen ?? false;
