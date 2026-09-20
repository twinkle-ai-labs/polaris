// 배포본에는 서버가 없다 — 그래서 API도 파일로 굽는다.
// GitHub Pages는 정적 파일에 Access-Control-Allow-Origin: * 을 붙여 내보내므로,
// 어느 앱에서든 그대로 fetch 할 수 있다.

import fs from "node:fs";
import path from "node:path";
import {
  currentVersion,
  listApps,
  listDocs,
  pastVersions,
  publishedLocales,
  readApp,
  readSite,
  upcomingVersion,
} from "../src/lib/content.mjs";
import { appPath, docPath, versionPath } from "../src/lib/paths.mjs";

const OUT = path.join(process.cwd(), "out");
const API = path.join(OUT, "api", "v1");
const site = readSite();
const origin = site.domain ? `https://${site.domain}` : "";
const url = (p) => `${origin}${p}`;

/*
 * 주소는 화면이 쓰는 함수로 짓는다 — 여기서 손으로 이어 붙이지 않는다.
 * 언어가 정해지지 않은 자리(앱 · 문서의 머리)는 그 앱의 기본 언어로 간다 — 주소의 첫 칸은
 * 늘 언어라서, 언어 없이 설 수 있는 장이 없다.
 */

function write(relative, data) {
  const file = path.join(API, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return file;
}

function versionPayload(v) {
  return {
    locale: v.locale,
    version: v.version,
    title: v.title,
    summary: v.summary,
    effectiveAt: v.effectiveAt,
    url: url(docPath(v.locale, v.appSlug, v.docSlug)),
  };
}

if (!fs.existsSync(OUT)) {
  console.error("out/ 이 없습니다. `next build` 를 먼저 돌리세요.");
  process.exit(1);
}

const apps = listApps();
let files = 0;

for (const app of apps) {
  const docs = listDocs(app.slug).filter((d) => publishedLocales(app.slug, d.slug).length);

  for (const doc of docs) {
    const locales = publishedLocales(app.slug, doc.slug);

    for (const locale of locales) {
      const current = currentVersion(app.slug, doc.slug, locale);
      /*
       * 앱 이름은 **그 로케일의 것**이어야 한다. `app` 은 바깥에서 한 번 읽은 것이라
       * 기본 언어(ko)의 이름을 들고 있다 — 그대로 실으면 독일어 약관 payload 에
       * «주식 계산기» 가 실린다. 이름은 이미 열한 벌 있는데 아무도 안 고르고 있었다.
       */
      const named = readApp(app.slug, locale) ?? app;
      /*
       * **사전 공지는 본문 API 에도 실린다** (2026-09-20).
       *
       * 앱이 약관 화면에 그리는 것은 이 파일이고, 여태 `upcoming` 은 문서 API
       * (`<문서>.json`)에만 있었다. 그래서 «언제부터 제 몇 판» 이라는 공지는 **웹 페이지에만**
       * 떴다 — 약관 2조 ③ 이 «불리한 변경은 30일 전에 공지»라고 약속해 놓고, 그 30일 동안
       * 앱에서 약관을 여는 사람은 다음 판이 온다는 것을 볼 길이 없었다. 공지는 읽는 자리에
       * 있어야 공지다.
       *
       * **없으면 칸을 아예 두지 않는다** — `null` 을 싣지 않는 이유는 취향이 아니다.
       * 앱들이 이 파일을 **바이트째** 번들에 싣고 `policy-bundle.sh` 가 `cmp` 로 견주므로,
       * 빈 칸 하나를 더하는 것만으로 세 앱의 사본 마흔여섯 장이 한꺼번에 어긋난다 —
       * 글은 한 글자도 안 바뀌었는데. 받는 쪽(kotlinx.serialization)에게 «없음»과 «null» 은
       * 같은 값이다.
       */
      const upcoming = upcomingVersion(app.slug, doc.slug, locale);
      write(`apps/${app.slug}/${doc.slug}/${locale}.json`, {
        app: { slug: app.slug, name: named.name },
        doc: { slug: doc.slug, name: doc.name, kind: doc.kind },
        ...versionPayload(current),
        format: "markdown",
        body: current.body,
        ...(upcoming
          ? {
              upcoming: {
                version: upcoming.version,
                effectiveAt: upcoming.effectiveAt,
                // 그 판을 미리 읽는 자리 — 공지만 하고 글을 감추면 읽는 사람이 할 수 있는 일이 없다
                url: url(versionPath(locale, app.slug, doc.slug, upcoming.version)),
              },
            }
          : {}),
        past: pastVersions(app.slug, doc.slug, locale).map((v) => ({
          version: v.version,
          effectiveAt: v.effectiveAt,
          url: url(versionPath(locale, app.slug, doc.slug, v.version)),
        })),
      });
      files++;
    }

    write(`apps/${app.slug}/${doc.slug}.json`, {
      app: { slug: app.slug, name: app.name },
      slug: doc.slug,
      name: doc.name,
      kind: doc.kind,
      defaultLocale: app.defaultLocale,
      locales: locales.map((locale) => ({
        ...versionPayload(currentVersion(app.slug, doc.slug, locale)),
        upcoming: upcomingVersion(app.slug, doc.slug, locale)
          ? {
              version: upcomingVersion(app.slug, doc.slug, locale).version,
              effectiveAt: upcomingVersion(app.slug, doc.slug, locale).effectiveAt,
            }
          : null,
        content: url(`/api/v1/apps/${app.slug}/${doc.slug}/${locale}.json`),
      })),
    });
    files++;
  }

  write(`apps/${app.slug}.json`, {
    slug: app.slug,
    name: app.name,
    description: app.description,
    defaultLocale: app.defaultLocale,
    homepage: app.homepage,
    url: url(appPath(app.defaultLocale, app.slug)),
    docs: docs.map((doc) => ({
      slug: doc.slug,
      name: doc.name,
      kind: doc.kind,
      locales: publishedLocales(app.slug, doc.slug),
      url: url(docPath(app.defaultLocale, app.slug, doc.slug)),
      detail: url(`/api/v1/apps/${app.slug}/${doc.slug}.json`),
    })),
  });
  files++;
}

write("index.json", {
  site: { name: site.name, tagline: site.tagline, url: origin || null },
  generatedAt: new Date().toISOString(),
  apps: apps.map((app) => ({
    slug: app.slug,
    name: app.name,
    url: url(appPath(app.defaultLocale, app.slug)),
    detail: url(`/api/v1/apps/${app.slug}.json`),
  })),
});
files++;

// Pages가 밑줄로 시작하는 Next 자산을 삼키지 않게 한다.
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
if (site.domain) fs.writeFileSync(path.join(OUT, "CNAME"), `${site.domain}\n`);

console.log(`API ${files}개 파일을 out/api/v1 에 구웠습니다.${site.domain ? " CNAME 포함." : ""}`);
