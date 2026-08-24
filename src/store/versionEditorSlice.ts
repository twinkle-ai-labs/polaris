import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/** 편집기의 두 칸 — 쓰는 자리와 읽는 자리. */
export type EditorPane = "write" | "read";

/**
 * 판본 편집기.
 *
 * 파일의 내용은 서버가 읽어 넘겨 준다. 여기 드는 것은 **아직 파일이 아닌 것** —
 * 지금 손으로 고치는 중인 글과, 어느 칸을 보고 있는가 둘뿐이다.
 * 저장은 폼이 서버 액션으로 보내므로, 이 상태는 저장을 거치지 않는다.
 */
type VersionEditorState = {
  /** 파일에서 읽어 온 것을 아직 한 번도 싣지 않았으면 null — 그때는 서버가 준 값을 그린다. */
  body: string | null;
  pane: EditorPane;
};

const initialState: VersionEditorState = { body: null, pane: "write" };

const versionEditorSlice = createSlice({
  name: "versionEditor",
  initialState,
  reducers: {
    /** 편집기가 열렸다 — 파일의 글을 그대로 받아 시작한다. 칸도 「쓰기」로 되돌린다. */
    editorOpened(state, action: PayloadAction<string>) {
      state.body = action.payload;
      state.pane = "write";
    },
    bodyEdited(state, action: PayloadAction<string>) {
      state.body = action.payload;
    },
    paneSwitched(state, action: PayloadAction<EditorPane>) {
      state.pane = action.payload;
    },
  },
});

export const { editorOpened, bodyEdited, paneSwitched } = versionEditorSlice.actions;
export default versionEditorSlice.reducer;

export const selectEditorBody = (state: RootState): string | null => state.versionEditor.body;
export const selectEditorPane = (state: RootState): EditorPane => state.versionEditor.pane;
