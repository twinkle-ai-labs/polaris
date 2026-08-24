/**
 * 나눔 카드(Open Graph 이미지)를 **코드로 굽는다**.
 *
 * 그림 파일을 손으로 그려 두면 문구를 고친 날 그림이 옛말을 하고 있게 된다 —
 * 카드의 말은 화면의 말과 **같은 자리**(`lib/`)에서 와야 한다. 여기서는 그 말을
 * 어떻게 세울지만 정하고, 무엇을 적을지는 부르는 쪽이 준다.
 *
 * 글꼴은 저장소가 든다. CDN 에서 받아 오면 빌드가 남의 서버 사정에 걸리고,
 * 시스템 글꼴에 기대면 내 기계에서만 한글이 나온다 — CI 에는 그 글꼴이 없다.
 * 실은 것은 라틴 + 현대 한글 음절만 남긴 부분집합이라 사용자에게는 나가지 않는다.
 */

import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

/** 나눔 카드의 판 — 페이스북·트위터·슬랙·카카오가 모두 이 비율을 기준으로 자른다. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/* Aurora Ledger — 카드는 **다크 한 벌**로 선다.
   나눔 카드가 설 자리(타임라인·메신저)의 바탕은 우리가 못 정하므로, 어느 바탕에
   놓여도 경계가 분명한 쪽을 고른다. 라이트 카드는 흰 타임라인에서 테두리를 잃는다. */
const INK = {
  bg: "#110D19",
  surface: "#1B1526",
  text: "#FAF7FF",
  sub: "#AEA3BA",
  primary: "#7040D9",
  glow: "#8550E4",
  accent: "#B79AFF",
} as const;

function fontFile(name: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "src/assets/fonts", name));
}

/** 굵기는 **가진 것만** 부른다 — 없는 굵기는 satori 가 이웃 칸으로 스냅한다. */
function fonts() {
  return [
    { name: "Pretendard", data: fontFile("Pretendard-Regular.otf"), weight: 400 as const, style: "normal" as const },
    { name: "Pretendard", data: fontFile("Pretendard-Bold.otf"), weight: 700 as const, style: "normal" as const },
  ];
}

/**
 * 실은 글꼴이 이 글자들을 그릴 수 있는가.
 *
 * Pretendard 는 라틴·한글·가나까지 든다 — **한자는 없다.** 없는 글자를 주면
 * satori 는 두부(□)를 그리므로, 일본어·중국어 문서의 제목이 네모 줄로 나간다.
 * 그런 카드는 없느니만 못하다 — 부르는 쪽이 이걸 물어보고 보관소의 기본 카드로 물러선다.
 *
 * 코드포인트를 세는 대신 «한자가 섞였는가»만 본다: 글꼴이 못 그리는 것이 한자뿐이라
 * 이 한 줄이 곧 그 답이다.
 */
const HAN = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]/;

export function isDrawable(...texts: (string | undefined)[]): boolean {
  return !texts.some((text) => text && HAN.test(text));
}

/**
 * 제목의 크기 — **자르지 않고 줄인다.**
 *
 * 길이가 정해지지 않은 값이 좁은 칸에 설 때 잘라 내면 틀린 말이 되므로, 글자 크기가
 * 사다리 칸을 따라 한 칸씩 내려와 칸에 맞춘다. 칸 수는 940px 폭에서 한글이 몇 자
 * 들어가는지로 잡았다 — 76px 에 열넷, 60px 에 열여덟쯤이다.
 */
function titleSize(title: string): number {
  if (title.length > 40) return 52;
  if (title.length > 24) return 64;
  return 76;
}

export type OgCard = {
  /** 작은 머리말 — 이 장이 어느 서랍의 것인가. */
  eyebrow: string;
  title: string;
  /** 한 줄 설명. 길면 카드가 글자로 가득 차므로 두 줄에서 끊는다. */
  lead?: string;
  /** 발치에 서는 주소 — 어디서 온 카드인지. */
  domain: string;
};

/**
 * 카드 한 장.
 *
 * 오로라는 **면**으로 깐다 — 큰 원 두 개를 흐리게 눌러 두면 satori 에서 값이 비싸고
 * 결과가 기계마다 달라진다. 그래서 그라데이션 두 겹으로 같은 인상을 만든다.
 */
export function ogCard({ eyebrow, title, lead, domain }: OgCard) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: INK.bg,
          backgroundImage: [
            `radial-gradient(760px 520px at 92% 0%, rgba(183,154,255,0.28), rgba(17,13,25,0))`,
            `radial-gradient(620px 520px at 78% 36%, rgba(112,64,217,0.22), rgba(17,13,25,0))`,
            `radial-gradient(700px 420px at -8% 108%, rgba(112,64,217,0.34), rgba(17,13,25,0))`,
          ].join(","),
          border: "1px solid rgba(183,154,255,0.16)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Pretendard",
          color: INK.text,
        }}
      >
        <div style={{ position: "absolute", right: 86, top: 76, width: 250, height: 250, border: "1px solid rgba(183,154,255,0.18)", borderRadius: 999, boxShadow: "0 0 90px rgba(133,80,228,0.18)" }} />
        <div style={{ position: "absolute", right: 148, top: 138, width: 126, height: 126, border: "1px solid rgba(183,154,255,0.28)", borderRadius: 999 }} />
        <div style={{ position: "absolute", right: 202, top: 192, width: 18, height: 18, background: INK.accent, borderRadius: 999, boxShadow: "0 0 34px rgba(183,154,255,0.88)" }} />
        {/* 머리 — 심볼 없이 이름 자체가 브랜드가 된다. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            /* 자간을 주지 않는다 — satori 는 양수 자간에서 한글 사이의 **공백 한 칸을 삼킨다**
               («안드로이드를 만들며» → «안드로이드를만들며»). 눈썹에는 라틴만 오는 것이 아니므로,
               멋보다 낱말이 붙지 않는 쪽을 고른다. */
            style={{ fontSize: 26, fontWeight: 700, color: INK.accent, textTransform: "uppercase" }}
          >
            {eyebrow}
          </span>
        </div>

        {/* 몸 — 가장 큰 글자는 제목이다.
            한글은 낱말 안에서 끊지 않는다: 그냥 두면 «스튜디오입니다»가 «스튜디 / 오입니다»로 갈린다.
            길이가 정해지지 않은 값(제목·요약)이 판을 넘치지 않도록 이 칸이 남는 자리를 다 먹고
            **제 안에서 자른다** — 넘치면 발치의 실선이 글자 위로 올라탄다. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
            flexGrow: 1,
            overflow: "hidden",
            maxWidth: 940,
            wordBreak: "keep-all",
          }}
        >
          <span
            style={{
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: -1.5,
              lineClamp: 3,
            }}
          >
            {title}
          </span>
          {lead ? (
            <span style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.45, color: INK.sub, lineClamp: 2 }}>
              {lead}
            </span>
          ) : null}
        </div>

        {/* 발 — 주소 한 줄과 그 위의 실선. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              width: 180,
              height: 5,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${INK.primary}, ${INK.glow})`,
            }}
          />
          <span style={{ fontSize: 26, fontWeight: 400, color: INK.sub, letterSpacing: 0.4 }}>
            {domain}
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts() },
  );
}
