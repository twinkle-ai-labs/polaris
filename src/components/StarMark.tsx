/* 브랜드의 별 — brand/symbol-*.svg 의 그 모양.
   머리띠·히어로·바닥이 같은 얼굴을 쓴다.

   `gradientId` 를 주면 보라 그라데이션으로 채우고, 안 주면 currentColor 로 칠한다.
   SVG 의 <defs> id 는 문서에서 하나뿐이어야 하므로 부르는 쪽이 이름을 짓는다 —
   같은 이름이 두 번 있으면 둘째부터 첫째의 그라데이션을 본다. */

import { STAR_PATH } from "@/lib/star";

export default function StarMark({
  gradientId,
  className,
}: {
  gradientId?: string;
  className?: string;
}) {
  return (
    /* 크기는 CSS 가 정한다. 그래도 1em 을 적어 두는 것은 —
       스타일이 못 실린 자리(라우트에 따라 CSS 조각이 빠지는 일이 있다)에서
       viewBox 만 있는 svg 는 제 칸을 통째로 채워 화면을 삼키기 때문이다.
       실제로 404 화면에서 별 하나가 창을 다 덮은 적이 있다.
       CSS 의 width/height 는 이 속성을 이긴다. */
    <svg
      className={className}
      viewBox="0 0 100 100"
      width="1em"
      height="1em"
      aria-hidden="true"
    >
      {gradientId ? (
        <defs>
          <linearGradient
            id={gradientId}
            x1="14"
            y1="86"
            x2="86"
            y2="14"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" style={{ stopColor: "var(--primary)" }} />
            <stop offset="1" style={{ stopColor: "var(--primary-lit)" }} />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d={STAR_PATH}
        fill={gradientId ? `url(#${gradientId})` : "currentColor"}
      />
    </svg>
  );
}
