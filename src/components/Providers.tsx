"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import ScrollSync from "./ScrollSync";
import ThemeSync from "./ThemeSync";

/**
 * 가게를 세우고, 바깥 세계를 그 안으로 실어 나르는 조각 둘을 함께 건다.
 *
 * 가게는 **브라우저에서 한 번만** 지어진다 — `useRef` 가 그 「한 번」을 지킨다.
 * (모듈 자리에 세워 두면 서버에서 구워지는 동안에도 살아 있어, 화면 사이에 상태가 샌다.)
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  storeRef.current ??= makeStore();

  return (
    <Provider store={storeRef.current}>
      <ThemeSync />
      <ScrollSync />
      {children}
    </Provider>
  );
}
