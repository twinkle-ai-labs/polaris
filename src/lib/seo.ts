/**
 * 검색과 나눔에 나가는 것 — 정본 주소(canonical), 언어 안내(hreflang), 나눔 카드.
 *
 * 이 보관소는 같은 문서가 열한 언어로 선다. 언어마다 주소가 다르므로 검색 엔진에게
 * 두 가지를 말해 줘야 한다 — «이 주소가 이 언어의 정본이다»(canonical)와
 * «같은 문서의 다른 언어는 여기 있다»(hreflang). 안 말하면 열한 장이 서로
 * 중복 문서로 보여, 어느 언어도 제대로 서지 못한다.
 */

import type { Metadata } from "next";
import { publishedLocales, readSite, readVersion } from "./content.mjs";
import { LOCALES } from "./labels";
import { isDrawable, OG_SIZE } from "./og";
import { appPath, docPath, localeHome, versionPath } from "./site";

const site = readSite();

/** 이 보관소의 바깥 주소 — `site.json` 의 domain 이 정본이다. */
export const POLARIS_URL = `https://${site.domain}`;

/** 주소를 눈으로 읽는 꼴 — 나눔 카드의 발치에 선다. */
export const DOMAIN = site.domain;

/**
 * OpenGraph 의 언어 코드 — 우리 코드(`ko`)와 꼴이 다르다(`ko_KR`).
 * 지역이 붙지 않은 언어는 가장 큰 지역으로 편다.
 */
const OG_LOCALE: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
  it: "it_IT",
  "pt-BR": "pt_BR",
  id: "id_ID",
};

export function ogLocale(locale: string): string {
  return OG_LOCALE[locale] ?? locale.replace("-", "_");
}

/**
 * 홈·앱 목록의 언어 안내 — **모든** 언어가 선다.
 *
 * `x-default` 는 «어느 언어에도 안 걸리는 사람»이 갈 곳이다. 기본 언어의 주소를 준다.
 */
export function homeLanguages(pathOf: (locale: string) => string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const { value } of LOCALES) languages[value] = pathOf(value);
  languages["x-default"] = pathOf(site.defaultLocale);
  return languages;
}

/** 언어별 홈의 canonical + hreflang 한 벌. */
export function homeAlternates(locale: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localeHome(locale, site.defaultLocale),
    languages: homeLanguages((l) => localeHome(l, site.defaultLocale)),
  };
}

/** 앱 목록 장의 canonical + hreflang 한 벌. */
export function appAlternates(locale: string, app: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: appPath(locale, app),
    languages: homeLanguages((l) => appPath(l, app)),
  };
}

/**
 * 문서 장의 canonical + hreflang 한 벌 — **펴낸 언어만** 선다.
 *
 * 안 펴낸 언어를 hreflang 에 올리면 검색 엔진을 404 로 안내하는 일이다.
 */
export function docAlternates(locale: string, app: string, doc: string): NonNullable<Metadata["alternates"]> {
  const published = publishedLocales(app, doc);
  const languages: Record<string, string> = {};
  for (const l of published) languages[l] = docPath(l, app, doc);
  if (published.includes(site.defaultLocale)) {
    languages["x-default"] = docPath(site.defaultLocale, app, doc);
  }
  return { canonical: docPath(locale, app, doc), languages };
}

/**
 * 한 판본 장의 canonical + hreflang.
 *
 * 그 판본이 **지금 유효한 것**이면 정본은 판본 주소가 아니라 문서 주소다 —
 * 같은 글이 두 주소에 서 있으므로, 사람이 링크로 나눌 만한 쪽(`/…/terms/`)을 정본으로 준다.
 * 지난 판은 제 주소가 정본이다: 그 글은 거기 말고 어디에도 없다.
 */
export function versionAlternates(
  locale: string,
  app: string,
  doc: string,
  version: number,
  isCurrent: boolean,
): NonNullable<Metadata["alternates"]> {
  if (isCurrent) return { canonical: docPath(locale, app, doc) };
  const languages: Record<string, string> = {};
  for (const l of publishedLocales(app, doc)) {
    if (readVersion(app, doc, l, version)?.status === "published") {
      languages[l] = versionPath(l, app, doc, version);
    }
  }
  return { canonical: versionPath(locale, app, doc, version), languages };
}

/** 보관소의 기본 카드 — 홈·앱 목록이 쓰고, 문서가 제 카드를 못 구울 때 물러설 자리다. */
export const SITE_OG_IMAGE = "/og.png";

/**
 * 한 문서의 나눔 카드 주소.
 *
 * 한자를 쓰는 언어는 실은 글꼴이 그리지 못해 카드를 굽지 않는다(`lib/og` 의 `isDrawable`).
 * 그 언어의 장은 굽지도 않은 그림을 가리키면 안 되므로 보관소의 기본 카드로 물러선다.
 */
export function docOgImage(locale: string, app: string, doc: string, ...words: (string | undefined)[]): string {
  return isDrawable(...words) ? `${docPath(locale, app, doc)}og.png` : SITE_OG_IMAGE;
}

/** 나눔 카드의 크기 — 굽는 쪽([lib/og])이 정하고 여기서는 가리키기만 한다. */

/**
 * 한 장의 나눔 정보(OpenGraph·트위터) 한 벌.
 *
 * Next 는 `openGraph` 를 **통째로** 갈아 끼운다 — 장이 제목만 적으면 레이아웃이
 * 정한 카드 그림·이름이 조용히 떨어진다. 그래서 장은 이 함수로 한 벌을 통째로 짓는다.
 */
export function shareCard({
  title,
  description,
  path,
  locale,
  image = "/og.png",
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const imageEntry = { url: image, ...OG_SIZE, alt: title, type: "image/png" };
  return {
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale(locale),
      url: path,
      title,
      description,
      images: [imageEntry],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/** JSON-LD — 보관소가 무엇인지 한 번만 말한다(레이아웃에 선다). */
export function jsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${POLARIS_URL}/#website`,
    url: `${POLARIS_URL}/`,
    name: site.name,
    description: site.tagline,
    inLanguage: LOCALES.map((l) => l.value),
    publisher: {
      "@type": "Organization",
      name: site.operator,
      url: "https://twinklelabs.kr/",
      email: site.contactEmail,
    },
  });
}
