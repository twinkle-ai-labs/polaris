export type Site = {
  /** 보관소의 이름 — Polaris. 운영자의 이름과 다른 것이다. */
  name: string;
  /** 약관 본문에서 «운영자»라고 불리는 쪽 — Twinkle AI Labs. */
  operator: string;
  tagline: string;
  domain: string;
  contactEmail: string;
  defaultLocale: string;
  timezone: string;
};
export type AppMeta = {
  slug: string;
  name: string;
  description: string;
  defaultLocale: string;
  homepage: string;
  icon: string;
};
export type DocMeta = { slug: string; appSlug: string; name: string; kind: string; order: number };
export type VersionDoc = {
  appSlug: string;
  docSlug: string;
  locale: string;
  version: number;
  title: string;
  status: "draft" | "published";
  effectiveAt: string;
  /** 며칠 앞서 알리기로 약속한 판인가. 안 적었으면 null — 세는 쪽이 DEFAULT_NOTICE_DAYS 로 본다 */
  notice: number | null;
  summary: string;
  body: string;
};

export const CONTENT_DIR: string;
export const DEFAULT_NOTICE_DAYS: number;
/** 오늘 — 운영자의 시간대(site.json 의 timezone)로 센 `YYYY-MM-DD` */
export function today(): string;
export function parseFrontmatter(raw: string): { data: Record<string, string>; body: string };
export function toFrontmatter(data: Record<string, unknown>, body: string): string;
export function readSite(locale?: string): Site;
export function listApps(locale?: string): AppMeta[];
export function readApp(slug: string, locale?: string): AppMeta | null;
export function listDocs(appSlug: string): DocMeta[];
export function readDoc(appSlug: string, docSlug: string): DocMeta | null;
export function listLocales(appSlug: string, docSlug: string): string[];
export function listVersions(appSlug: string, docSlug: string, locale: string): VersionDoc[];
export function readVersion(
  appSlug: string,
  docSlug: string,
  locale: string,
  version: number,
): VersionDoc | null;
export function nextVersionNo(appSlug: string, docSlug: string, locale: string): number;
export function currentVersion(
  appSlug: string,
  docSlug: string,
  locale: string,
  now?: string,
): VersionDoc | null;
export function upcomingVersion(
  appSlug: string,
  docSlug: string,
  locale: string,
  now?: string,
): VersionDoc | null;
export function pastVersions(
  appSlug: string,
  docSlug: string,
  locale: string,
  now?: string,
): VersionDoc[];
export function resolve(
  appSlug: string,
  docSlug: string,
  wanted: string,
): { version: VersionDoc; servedLocale: string; requestedLocale: string } | null;
export function publishedLocales(appSlug: string, docSlug: string): string[];
export function everyRoute(): { app: string; doc: string; locale: string }[];

/** 로케일별로 갈릴 수 있는 값 하나를 고른다. 글자면 그대로, 표면이면 그 언어의 것 */
export function pick(value: unknown, locale: string, fallbackLocale?: string): string;
