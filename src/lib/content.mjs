// 내용은 저장소의 파일이다 — 서버도 DB도 없다. 이력은 git이 기억한다.
//
//   content/site.json
//   content/apps/<app>/app.json
//   content/apps/<app>/<doc>/doc.json
//   content/apps/<app>/<doc>/<locale>/<version>.md
//
// 이 모듈은 화면(Next)과 API 생성 스크립트(node)가 함께 읽는다. 그래서 순수 ESM이다.

import fs from "node:fs";
import path from "node:path";

export const CONTENT_DIR = path.join(process.cwd(), "content");
const APPS_DIR = path.join(CONTENT_DIR, "apps");
/* 앱의 얼굴이 사는 곳. 규칙은 파일 이름 하나다 — `public/apps/<slug>.png` 를 놓으면
   그 앱이 제 아이콘으로 서고, 없으면 이름의 첫 글자가 대신 선다.
   설정에 한 줄 더 적게 하지 않는다: 놓는 것이 곧 켜는 것이다. */
const ICONS_DIR = path.join(process.cwd(), "public", "apps");

/* ── 파일 머리말 ────────────────────────────────────────────── */

/** `---` 로 감싼 머리말을 읽는다. 값은 항상 한 줄짜리 문자열이라 YAML 전부는 필요 없다. */
export function parseFrontmatter(raw) {
  // 밖에서 고친 파일이 CRLF로 와도 읽는 쪽에서 한 번 고른다.
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    if (key) data[key] = value;
  }
  return { data, body: text.slice(match[0].length).trim() };
}

export function toFrontmatter(data, body) {
  // 브라우저의 textarea는 줄바꿈을 CRLF로 보낸다 — 파일에는 LF만 남긴다.
  const text = String(body).replace(/\r\n/g, "\n");
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: "${String(v).replace(/"/g, '\\"')}"`);
  return `---\n${lines.join("\n")}\n---\n\n${text.trim()}\n`;
}

/* ── 읽기 ───────────────────────────────────────────────────── */

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function dirs(where) {
  try {
    return fs
      .readdirSync(where, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * 로케일별로 갈릴 수 있는 값 하나를 고른다.
 *
 * 글자 하나면 모든 언어가 그것을 쓰고(옛 내용이 그대로 돈다), 표면 `{ ko: …, en: … }` 이면
 * 그 언어의 것을 고른다. 없으면 기본 언어, 그것도 없으면 첫 번째 — **비어 있는 화면보다
 * 남의 언어라도 있는 편이 낫다.**
 */
export function pick(value, locale, fallbackLocale = "ko") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value[String(locale).split("-")[0]] ?? value[fallbackLocale] ?? Object.values(value)[0] ?? "";
}

export function readSite(locale) {
  const site = readJson(path.join(CONTENT_DIR, "site.json"), {});
  const at = locale ?? site.defaultLocale ?? "ko";
  return {
    // 보관소의 이름은 Polaris 다 — 운영자의 이름(Twinkle AI Labs)과 다른 것이고,
    // 약관 본문에서 «운영자»라고 불리는 쪽은 아래 operator 다.
    name: site.name || "Polaris",
    operator: site.operator || "",
    tagline: pick(site.tagline, at, site.defaultLocale || "ko"),
    domain: site.domain || "",
    contactEmail: site.contactEmail || "",
    // 목록 화면(홈·앱)에는 문서가 없으니 언어를 정해 줄 것도 없다. 사이트가 정한다.
    defaultLocale: site.defaultLocale || "ko",
    // 시행일을 어느 시간대의 날짜로 셀 것인가.
    timezone: site.timezone || "Asia/Seoul",
  };
}

export function listApps(locale) {
  return dirs(APPS_DIR)
    .map((slug) => readApp(slug, locale))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, locale || "ko"));
}

export function readApp(slug, locale) {
  const file = path.join(APPS_DIR, slug, "app.json");
  if (!fs.existsSync(file)) return null;
  const meta = readJson(file, {});
  const at = locale ?? "ko";
  const icon = fs.existsSync(path.join(ICONS_DIR, `${slug}.png`))
    ? `/apps/${slug}.png`
    : "";
  return {
    slug,
    name: pick(meta.name, at) || slug,
    description: pick(meta.description, at),
    defaultLocale: meta.defaultLocale || "ko",
    homepage: meta.homepage || "",
    icon,
  };
}

export function listDocs(appSlug) {
  return dirs(path.join(APPS_DIR, appSlug))
    .map((docSlug) => readDoc(appSlug, docSlug))
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name, "ko"));
}

export function readDoc(appSlug, docSlug) {
  const file = path.join(APPS_DIR, appSlug, docSlug, "doc.json");
  if (!fs.existsSync(file)) return null;
  const meta = readJson(file, {});
  return {
    slug: docSlug,
    appSlug,
    name: meta.name || docSlug,
    kind: meta.kind || "custom",
    order: typeof meta.order === "number" ? meta.order : 99,
  };
}

export function listLocales(appSlug, docSlug) {
  return dirs(path.join(APPS_DIR, appSlug, docSlug));
}

/** 한 언어의 모든 판본. 새 것이 앞에 온다. */
export function listVersions(appSlug, docSlug, locale) {
  const where = path.join(APPS_DIR, appSlug, docSlug, locale);
  let files = [];
  try {
    files = fs.readdirSync(where).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  return files
    .map((f) => readVersion(appSlug, docSlug, locale, Number(f.replace(/\.md$/, ""))))
    .filter(Boolean)
    .sort((a, b) => b.version - a.version);
}

export function readVersion(appSlug, docSlug, locale, version) {
  const file = path.join(APPS_DIR, appSlug, docSlug, locale, `${version}.md`);
  if (!Number.isFinite(version) || !fs.existsSync(file)) return null;
  const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  return {
    appSlug,
    docSlug,
    locale,
    version,
    title: data.title || "",
    status: data.status === "published" ? "published" : "draft",
    effectiveAt: data.effectiveAt || "",
    /*
     * 이 판을 **며칠 앞서 알리기로 약속했나**. 약관 2조는 «사전에 공지»(통상 한 주)와
     * «불리한 변경은 30일 전»을 나눠 적는데, 어느 쪽인지는 글을 읽고 사람이 정한다 —
     * 기계는 그 판단을 못 한다. 그래서 사람이 정한 수를 여기 적어 두고,
     * `scripts/check-notice.mjs` 가 내보내는 날 그 약속이 지켜지는지 센다.
     * 안 적혀 있으면 [DEFAULT_NOTICE_DAYS] 로 본다.
     */
    notice: Number(data.notice) > 0 ? Number(data.notice) : null,
    summary: data.summary || "",
    body,
  };
}

/** 약속을 안 적은 판의 공지 기간 — 통상의 한 주 (Polaris 2026-09-16 · Pocket PDF 제2판) */
export const DEFAULT_NOTICE_DAYS = 7;

export function nextVersionNo(appSlug, docSlug, locale) {
  const all = listVersions(appSlug, docSlug, locale);
  return all.length ? all[0].version + 1 : 1;
}

/* ── 무엇을 내보낼 것인가 ───────────────────────────────────── */

/**
 * 오늘. **운영자의 시간대**로 센다.
 *
 * UTC로 세면 «9월 1일 시행»이 한국에서 그날 아침 9시에야 바뀐다 — 시행일은
 * 약속한 날의 0시부터라야 약속이다. 시간대는 site.json의 `timezone`이 정한다.
 */
export function today() {
  const zone = readSite().timezone;
  try {
    // en-CA 는 YYYY-MM-DD 로 적는다 — 우리 파일의 날짜 형식과 같다.
    return new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** 지금 유효한 판본 — 펴냈고, 발효일이 지났고, 그중 가장 최근 것. */
export function currentVersion(appSlug, docSlug, locale, now = today()) {
  return (
    listVersions(appSlug, docSlug, locale)
      .filter((v) => v.status === "published" && v.effectiveAt && v.effectiveAt <= now)
      .sort((a, b) => (a.effectiveAt < b.effectiveAt ? 1 : a.effectiveAt > b.effectiveAt ? -1 : b.version - a.version))[0] || null
  );
}

/** 아직 오지 않은 판본 — 날짜만 기다린다. */
export function upcomingVersion(appSlug, docSlug, locale, now = today()) {
  return (
    listVersions(appSlug, docSlug, locale)
      .filter((v) => v.status === "published" && v.effectiveAt > now)
      .sort((a, b) => (a.effectiveAt < b.effectiveAt ? -1 : 1))[0] || null
  );
}

/** 지난 판본들 — 새 것부터. */
export function pastVersions(appSlug, docSlug, locale, now = today()) {
  const current = currentVersion(appSlug, docSlug, locale, now);
  return listVersions(appSlug, docSlug, locale).filter(
    (v) => v.status === "published" && v.effectiveAt <= now && v.version !== current?.version,
  );
}

/** 요청한 언어에 없으면 지역을 떼어 보고, 그래도 없으면 앱의 기본 언어로 되돌아간다. */
export function resolve(appSlug, docSlug, wanted) {
  const app = readApp(appSlug);
  if (!app) return null;
  const tries = [wanted, String(wanted || "").split("-")[0], app.defaultLocale].filter(
    (l, i, all) => l && all.indexOf(l) === i,
  );
  for (const locale of tries) {
    const version = currentVersion(appSlug, docSlug, locale);
    if (version) return { version, servedLocale: locale, requestedLocale: wanted };
  }
  return null;
}

/** 지금 내보낼 수 있는 언어들 — 화면의 언어 고르개와 정적 경로가 이걸 쓴다. */
export function publishedLocales(appSlug, docSlug) {
  return listLocales(appSlug, docSlug).filter((l) => currentVersion(appSlug, docSlug, l));
}

/** 정적으로 구울 모든 (앱, 문서, 언어) 조합. */
export function everyRoute() {
  const out = [];
  for (const app of listApps()) {
    for (const doc of listDocs(app.slug)) {
      for (const locale of publishedLocales(app.slug, doc.slug)) {
        out.push({ app: app.slug, doc: doc.slug, locale });
      }
    }
  }
  return out;
}
