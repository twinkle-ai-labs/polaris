"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { scrollChanged } from "@/store/scrollSlice";

/**
 * 스크롤을 **한 번만** 재서 가게에 싣는다.
 *
 * 듣는 이가 늘어도 창에 붙는 손은 하나다. 프레임마다 한 번으로 묶는 것은 —
 * `scroll` 은 한 번 굴릴 때 수십 번 오는데, 그때마다 상태를 갈아 끼우면
 * 그리는 일이 스크롤을 따라잡지 못해 화면이 끈다.
 */
export default function ScrollSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let frame = 0;

    const publish = () => {
      frame = 0;
      dispatch(scrollChanged({ offset: window.scrollY, viewportHeight: window.innerHeight }));
    };

    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(publish);
    };

    publish();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [dispatch]);

  return null;
}
