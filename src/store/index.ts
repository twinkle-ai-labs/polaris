import { configureStore } from "@reduxjs/toolkit";
import choiceReducer from "./choiceSlice";
import dialogReducer from "./dialogSlice";
import { listenerMiddleware } from "./effects";
import localeReducer from "./localeSlice";
import localeMenuReducer from "./localeMenuSlice";
import scrollReducer from "./scrollSlice";
import themeReducer from "./themeSlice";
import versionEditorReducer from "./versionEditorSlice";

/**
 * 가게를 **부를 때마다 새로 짓는다.**
 *
 * 모듈 한 자리에 하나 세워 두면 그 하나가 모듈이 실린 채로 사는데, 서버에서 한 번
 * 구워지는 이 사이트에서는 그 「하나」가 요청 사이에 남을 수 있다. 상태는 화면 하나의
 * 것이므로 [Providers] 가 브라우저에서 한 번 짓고 그 뒤로는 같은 것을 쓴다.
 *
 * 편집기의 칸 셋(`choice`·`dialog`·`versionEditor`)도 함께 든다. 편집기 **화면**은
 * 배포본에 실리지 않지만(`*.dev.tsx`), 칸을 조건으로 끼웠다 뺐다 하면 상태의 모양이
 * 환경마다 달라진다 — 그 몇 바이트보다 **어디서나 같은 모양**이 싸다.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      theme: themeReducer,
      scroll: scrollReducer,
      locale: localeReducer,
      localeMenu: localeMenuReducer,
      choice: choiceReducer,
      dialog: dialogReducer,
      versionEditor: versionEditorReducer,
    },
    /* 부수효과는 리듀서보다 **먼저** 선다 — 상태가 바뀐 뒤에 화면과 쿠키를 맞춘다. */
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
