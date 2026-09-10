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
      write(`apps/${app.slug}/${doc.slug}/${locale}.json`, {
        app: { slug: app.slug, name: named.name },
        doc: { slug: doc.slug, name: doc.name, kind: doc.kind },
        ...versionPayload(current),
        format: "markdown",
        body: current.body,
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
