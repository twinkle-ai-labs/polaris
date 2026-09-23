"use server";

// 편집기의 손 — content/ 안의 파일을 직접 고친다.
// 로컬에서만 돈다. 배포본에는 편집기 화면 자체가 실리지 않는다.

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CONTENT_DIR, nextVersionNo, readVersion, toFrontmatter } from "./content.mjs";

const APPS = path.join(CONTENT_DIR, "apps");

function guard() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("편집기는 로컬에서만 돕니다.");
  }
}

function slugify(raw: string) {
  const slug = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("주소로 쓸 이름(slug)이 필요합니다.");
  return slug;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function refresh() {
  revalidatePath("/", "layout");
}

/* ── 앱 ─────────────────────────────────────────────────────── */

export async function saveApp(form: FormData) {
  guard();
  const before = text(form, "before");
  const slug = slugify(text(form, "slug"));
  const dir = path.join(APPS, slug);

  if (before && before !== slug) fs.renameSync(path.join(APPS, before), dir);
  writeJson(path.join(dir, "app.json"), {
    name: text(form, "name") || slug,
    description: text(form, "description"),
    defaultLocale: text(form, "defaultLocale") || "ko",
    timezone: text(form, "timezone") || "Asia/Seoul",
    homepage: text(form, "homepage"),
  });

  refresh();
  redirect(`/admin/${slug}/`);
}

export async function removeApp(form: FormData) {
  guard();
  fs.rmSync(path.join(APPS, slugify(text(form, "slug"))), { recursive: true, force: true });
  refresh();
  redirect("/admin/");
}

/* ── 문서 ───────────────────────────────────────────────────── */

export async function saveDoc(form: FormData) {
  guard();
  const app = slugify(text(form, "app"));
  const before = text(form, "before");
  const slug = slugify(text(form, "slug"));
  const dir = path.join(APPS, app, slug);

  if (before && before !== slug) fs.renameSync(path.join(APPS, app, before), dir);
  writeJson(path.join(dir, "doc.json"), {
    name: text(form, "name") || slug,
    kind: text(form, "kind") || "custom",
    order: Number(text(form, "order")) || 99,
  });

  refresh();
  redirect(`/admin/${app}/${slug}/`);
}

export async function removeDoc(form: FormData) {
  guard();
  const app = slugify(text(form, "app"));
  fs.rmSync(path.join(APPS, app, slugify(text(form, "slug"))), { recursive: true, force: true });
  refresh();
  redirect(`/admin/${app}/`);
}

/* ── 판본 ───────────────────────────────────────────────────── */

function versionFile(app: string, doc: string, locale: string, version: number) {
  return path.join(APPS, app, doc, locale, `${version}.md`);
}

/** 새 판본을 낳는다. 같은 언어의 마지막 글이 있으면 그것을 물려받아 시작한다. */
export async function newVersion(form: FormData) {
  guard();
  const app = slugify(text(form, "app"));
  const doc = slugify(text(form, "doc"));
  const locale = text(form, "locale") || "ko";
  const version = nextVersionNo(app, doc, locale);
  const seed = version > 1 ? readVersion(app, doc, locale, version - 1) : null;

  const file = versionFile(app, doc, locale, version);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    toFrontmatter(
      {
        title: seed?.title || text(form, "title") || "이용약관",
        status: "draft",
        effectiveAt: new Date().toISOString().slice(0, 10),
        summary: seed?.summary || "",
      },
      seed?.body || "## 제1조 (목적)\n\n",
    ),
  );

  refresh();
  redirect(`/admin/${app}/${doc}/${locale}/${version}/`);
}

export async function saveVersion(form: FormData) {
  guard();
  const app = slugify(text(form, "app"));
  const doc = slugify(text(form, "doc"));
  const locale = text(form, "locale");
  const version = Number(text(form, "version"));
  if (!locale || !Number.isFinite(version)) throw new Error("어느 판본인지 알 수 없습니다.");

  const effectiveAt = text(form, "effectiveAt");
  const status = text(form, "status") === "published" ? "published" : "draft";
  if (status === "published" && !effectiveAt) {
    throw new Error("펴내려면 시행일이 있어야 합니다.");
  }

  /*
   * 공지 기간은 편집기가 묻지 않는 값이라 **있던 것을 그대로 들고 간다.**
   * 머리말을 통째로 다시 쓰는 자리이므로, 옮겨 적지 않으면 저장 한 번에 조용히 사라진다 —
   * 그러면 30일을 약속한 판이 다음 검사부터 한 주짜리로 세어진다 (`check-notice.mjs`).
   */
  const notice = readVersion(app, doc, locale, version)?.notice ?? null;

  fs.writeFileSync(
    versionFile(app, doc, locale, version),
    toFrontmatter(
      {
        title: text(form, "title"),
        status,
        effectiveAt,
        notice,
        summary: text(form, "summary"),
      },
      String(form.get("body") ?? ""),
    ),
  );

  refresh();
  redirect(`/admin/${app}/${doc}/${locale}/${version}/?saved=1`);
}

export async function removeVersion(form: FormData) {
  guard();
  const app = slugify(text(form, "app"));
  const doc = slugify(text(form, "doc"));
  const locale = text(form, "locale");
  const version = Number(text(form, "version"));
  fs.rmSync(versionFile(app, doc, locale, version), { force: true });

  const dir = path.join(APPS, app, doc, locale);
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);

  refresh();
  redirect(`/admin/${app}/${doc}/`);
}

/* ── 사이트 ─────────────────────────────────────────────────── */

export async function saveSite(form: FormData) {
  guard();
  writeJson(path.join(CONTENT_DIR, "site.json"), {
    name: text(form, "name") || "Polaris",
    tagline: text(form, "tagline"),
    domain: text(form, "domain").replace(/^https?:\/\//, "").replace(/\/+$/, ""),
    contactEmail: text(form, "contactEmail"),
    defaultLocale: text(form, "defaultLocale") || "ko",
    timezone: text(form, "timezone") || "Asia/Seoul",
  });
  refresh();
  redirect("/admin/?saved=1");
}
