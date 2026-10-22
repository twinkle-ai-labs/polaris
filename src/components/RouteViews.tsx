"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    /** 우리 계측의 핑 — Analytics 의 부팅 스크립트가 단다. 측정 ID 가 없는 빌드(dev)에는 없다 */
    __twinkleBeacon?: () => void;
  }
}

/*
 * 화면을 갈아 끼울 때 한 번 더 센다.
 *
 * gtag 는 **문서가 새로 열릴 때만** 스스로 페이지뷰를 보낸다. 그런데 이 사이트의
 * 링크는 문서를 새로 열지 않고 화면만 갈아 끼우므로(App Router), 그대로 두면
 * 사람이 몇 장을 넘겨 보든 통계에는 **첫 장 하나**만 남는다.
 *
 * 첫 번째 경로는 건너뛴다 — 그건 `config` 가 이미 보냈고, 여기서 또 보내면
 * 첫 장의 조회수만 두 배가 된다.
 */
export default function RouteViews() {
  const path = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.gtag?.("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
    // 우리 계측도 한 장 더 — 첫 장은 부팅 스크립트가 이미 보냈다
    window.__twinkleBeacon?.();
  }, [path]);

  return null;
}
