// 걷힌 `/t/` 가지의 주소를 **지금의 주소로 넘기는 장**을 굽는다.
//
// 2026-08-24 에 주소를 로케일 우선(`/{locale}/{app}/…`)으로 옮기며 `/t/` 가지를 걷었다.
// 그런데 그 주소는 이미 밖에 퍼져 있었다 — 앱 번들의 방침 사본(`res/raw/policy_*.json`)이
// 들고 있고, Play 콘솔의 개인정보처리방침 칸이 들고 있었고(2026-09-10 에 검토를 404 로 막았다),
// 이 API 도 보름 동안 그 주소를 실어 보냈다. 이미 설치된 앱의 사본은 우리가 고칠 수 없다.
// **옮긴 주소는 지우지 않는다 — 넘긴다.**
//
// 배포본(GitHub Pages)에는 서버가 없어 넘김 응답(301)을 줄 수 없다. 그래서 옛 자리마다
// 즉시 넘기는 HTML 한 장을 둔다: `meta refresh` 와 `location.replace` 둘 — 스크립트가 없는
// 곳에서도 넘어가고, 있는 곳에서는 뒤로 가기에 옛 주소가 남지 않는다. `canonical` 이 새 주소를
// 말하고 `noindex` 가 옛 주소를 지도에서 뺀다.

import fs from "node:fs";
import path from "node:path";
import { listApps, listDocs, listVersions, publishedLocales, readSite } from "../src/lib/content.mjs";
import { appPath, docPath, versionPath } from "../src/lib/paths.mjs";

const OUT = path.join(process.cwd(), "out");
const site = readSite();
const origin = site.domain ? `https://${site.domain}` : "";

if (!fs.existsSync(OUT)) {
  console.error("out/ 이 없습니다. `next build` 를 먼저 돌리세요.");
  process.exit(1);
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function page(to, lang) {
  const href = escape(to);
  const absolute = escape(`${origin}${to}`);
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<title>${escape(site.name)}</title>
<link rel="canonical" href="${absolute}">
<meta http-equiv="refresh" content="0; url=${href}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script>
</head>
<body><p><a href="${href}">${absolute}</a></p></body>
</html>
`;
}

/** 옛 주소 → 새 주소. 옛 가지의 모양 그대로 — 앱 · 문서 · 문서의 언어 · 판본, 그리고 가지의 머리. */
const moves = [["/t/", "/", site.defaultLocale]];
for (const app of listApps()) {
  moves.push([`/t/${app.slug}/`, appPath(app.defaultLocale, app.slug), app.defaultLocale]);
  for (const doc of listDocs(app.slug)) {
    const locales = publishedLocales(app.slug, doc.slug);
    if (!locales.length) continue;
    moves.push([`/t/${app.slug}/${doc.slug}/`, docPath(app.defaultLocale, app.slug, doc.slug), app.defaultLocale]);
    for (const locale of locales) {
      moves.push([`/t/${app.slug}/${doc.slug}/${locale}/`, docPath(locale, app.slug, doc.slug), locale]);
      for (const v of listVersions(app.slug, doc.slug, locale).filter((v) => v.status === "published")) {
        moves.push([
          `/t/${app.slug}/${doc.slug}/${locale}/v/${v.version}/`,
          versionPath(locale, app.slug, doc.slug, v.version),
          locale,
        ]);
      }
    }
  }
}

for (const [from, to, lang] of moves) {
  // 넘길 곳이 구워지지 않았으면 여기서 멈춘다 — 404 로 가는 넘김은 404 보다 나쁘다.
  const target = path.join(OUT, to, "index.html");
  if (!fs.existsSync(target)) {
    console.error(`넘길 곳이 없습니다: ${from} → ${to}`);
    process.exit(1);
  }
  const file = path.join(OUT, from, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(to, lang));
}

console.log(`옛 /t/ 주소 ${moves.length}개를 지금의 주소로 넘기는 장을 구웠습니다.`);
