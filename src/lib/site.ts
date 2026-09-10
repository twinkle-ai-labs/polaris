/**
 * 이름 밖의 주소와, 이 보관소 안의 길.
 *
 * 세 서브도메인(홈·디자인·약관)이 서로를 가리키므로 밖으로 나가는 주소는 **한 자리에** 둔다.
 * 머리띠와 바닥글이 같은 목록을 읽는 것도 같은 이유다 — 둘로 적어 두면
 * 메뉴가 하나 늘어난 날 한쪽만 늘어난다.
 */

import type { Strings } from "./i18n";

export const HOME_URL = "https://twinklelabs.kr/";
export const DESIGN_URL = "https://design.twinklelabs.kr/";
export const BLOG_URL = "https://blog.twinklelabs.kr/";

/**
 * 이 보관소의 홈 — 기본 언어는 `/`, 나머지는 `/<언어>/`.
 *
 * 기본 언어를 `/ko/` 로도 낼 수 있게 두지 않는다. 같은 화면이 두 주소에 서면
 * 검색 엔진이 어느 쪽을 정본으로 볼지 **스스로 정하고, 그 선택을 우리가 못 본다.**
 * 「기본 언어가 무엇인가」는 `site.json` 이 정하므로 여기에 `ko` 를 박지 않는다.
 */
export function localeHome(locale: string, defaultLocale: string): string {
  return locale === defaultLocale ? "/" : `/${locale}/`;
}

/** 앱 · 문서 · 판본의 길은 `paths.mjs` 한 자리에 산다 — 빌드 뒤 스크립트도 같은 함수를 부른다. */
export { appPath, docPath, versionPath } from "./paths.mjs";

/** 메뉴 한 칸. `key` 로 「지금 서 있는 곳」을 가린다 — 주소를 견주면 슬래시 하나에 어긋난다. */
export type NavLink = { key: string; label: string; href: string; isInternal: boolean };

/** 이 집이 서 있는 칸. */
export const CURRENT_NAV_KEY = "terms";

/** 메뉴의 말은 **문서의 언어**를 따른다 — 한국어 약관 위에 영어 머리글이 서면 안 된다. */
export function navLinks(t: Strings, locale: string, defaultLocale: string): NavLink[] {
  return [
    { key: "home", label: t.navHome, href: HOME_URL, isInternal: false },
    { key: "design", label: t.navDesign, href: DESIGN_URL, isInternal: false },
    { key: "blog", label: t.navBlog, href: BLOG_URL, isInternal: false },
    { key: CURRENT_NAV_KEY, label: t.navTerms, href: localeHome(locale, defaultLocale), isInternal: true },
  ];
}

/**
 * 지금 보고 있는 주소를 **다른 언어의 같은 자리**로 옮긴다.
 *
 * 약관을 읽다 언어를 바꾼 사람이 홈으로 튕겨 나가면, 읽던 자리를 다시 찾아 들어가야 한다.
 * 그래서 주소의 첫 칸(언어)만 갈아 끼운다 — 그 칸이 언어가 아니면(정적 파일 등)
 * 갈아 끼울 자리가 없다는 뜻이라 그 언어의 홈으로 보낸다.
 *
 * 순수 함수다 — 창도 라우터도 모른다. 옮길 곳을 정하는 일과 실제로 옮기는 일은 다른 일이다.
 */
export function localeSwappedPath(
  pathname: string,
  locale: string,
  defaultLocale: string,
  supportedLocales: readonly string[],
): string {
  const parts = pathname.split("/").filter(Boolean);
  const isLocaleFirst = parts.length >= 2 && supportedLocales.includes(parts[0]);
  return isLocaleFirst
    ? `/${locale}/${parts.slice(1).join("/")}/`
    : localeHome(locale, defaultLocale);
}
