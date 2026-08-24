/**
 * 구운 HTML 의 `<html lang>` 을 **그 장의 언어**로 고쳐 적는다.
 *
 * Next 의 루트 레이아웃은 어느 주소가 그려지는지 모른다 — `<html>` 은 거기 한 벌뿐인데
 * `params` 는 그 아래에서야 생기기 때문이다. 그래서 구운 열한 언어가 모두
 * `lang="ko"` 를 달고 나간다. 화면이 서면 `store/effects` 가 고치지만, **그때는 늦다**:
 * 검색 엔진과 번역기와 화면 낭독기는 스크립트가 돌기 전의 HTML 을 읽고,
 * 낭독기는 일본어 약관을 한국어 발음으로 읽어 버린다.
 *
 * 그래서 다 구운 뒤에 한 번 도장을 찍는다. 언어는 주소의 첫 칸이 말해 준다 —
 * 그 칸이 언어가 아니면(홈·404) 보관소의 기본 언어다.
 */

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const site = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/site.json"), "utf8"));
const DEFAULT_LOCALE = site.defaultLocale || "ko";

/** 펴낼 수 있는 언어 — 주소의 첫 칸이 이 중 하나여야 언어로 친다. */
const LOCALES = new Set(
  fs
    .readFileSync(path.join(process.cwd(), "src/lib/labels.ts"), "utf8")
    .matchAll(/\{\s*value:\s*"([^"]+)",\s*label:/g)
    .map((match) => match[1]),
);

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    // 구운 API(JSON)에는 문서가 없다.
    if (entry.isDirectory()) {
      if (entry.name !== "api" || dir !== OUT) yield* htmlFiles(full);
    } else if (entry.name.endsWith(".html")) {
      yield full;
    }
  }
}

let stamped = 0;
for (const file of htmlFiles(OUT)) {
  const first = path.relative(OUT, file).split(path.sep)[0];
  const locale = LOCALES.has(first) ? first : DEFAULT_LOCALE;
  if (locale === DEFAULT_LOCALE) continue;

  const html = fs.readFileSync(file, "utf8");
  const next = html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
  if (next === html) continue;
  fs.writeFileSync(file, next);
  stamped += 1;
}

console.log(`html lang 을 ${stamped}개 파일에 그 장의 언어로 찍었습니다.`);
