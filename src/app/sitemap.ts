import type { MetadataRoute } from "next";
import {
  currentVersion,
  everyRoute,
  listApps,
  listVersions,
  publishedLocales,
  readSite,
} from "@/lib/content.mjs";
import { LOCALES } from "@/lib/labels";
import { POLARIS_URL, homeLanguages } from "@/lib/seo";
import { appPath, docPath, localeHome, versionPath } from "@/lib/site";

/**
 * 보관소의 모든 장 — 열한 언어 × 앱 × 문서 × 판본.
 *
 * 링크만으로는 여기 닿지 못하는 장이 많다: 언어 고르개는 스크립트로 움직이고,
 * 지난 판본은 문서 한 장 안쪽에 접혀 있다. 지도가 없으면 그 장들은 **없는 것과 같다.**
 *
 * `alternates.languages` 를 함께 적는 것은 화면의 hreflang 과 같은 말을 지도에서도
 * 하기 위해서다 — 둘이 어긋나면 검색 엔진은 둘 다 믿지 않는다.
 */

/* 배포본은 서버가 없다 — 이 파일은 빌드 때 한 번 구워져 정적 파일로 남는다. */
export const dynamic = "force-static";

const at = (path: string) => `${POLARIS_URL}${path}`;

function languagesOf(pathOf: (locale: string) => string, locales: readonly string[]) {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = at(pathOf(locale));
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const site = readSite();
  const every = LOCALES.map((l) => l.value);
  const entries: MetadataRoute.Sitemap = [];

  /* 홈 — 언어마다 한 장. 기본 언어는 `/` 다. */
  const homeLanguagesMap = homeLanguages((l) => at(localeHome(l, site.defaultLocale)));
  for (const locale of every) {
    entries.push({
      url: at(localeHome(locale, site.defaultLocale)),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: homeLanguagesMap },
    });
  }

  /* 앱 목록 — 언어 × 앱. */
  for (const app of listApps()) {
    const languages = languagesOf((l) => appPath(l, app.slug), every);
    for (const locale of every) {
      entries.push({
        url: at(appPath(locale, app.slug)),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages },
      });
    }
  }

  /* 문서의 현행 판 — 이 보관소가 사람들에게 보이려는 것의 알맹이다. */
  for (const route of everyRoute()) {
    entries.push({
      url: at(docPath(route.locale, route.app, route.doc)),
      changeFrequency: "yearly",
      priority: 0.9,
      alternates: {
        languages: languagesOf(
          (l) => docPath(l, route.app, route.doc),
          publishedLocales(route.app, route.doc),
        ),
      },
    });
  }

  /* 지난 판본 — 낮은 자리에 둔다. 찾아올 사람은 있지만 먼저 보일 것은 아니다.
     **현행 판본은 넣지 않는다**: 그 주소의 정본은 문서 쪽(`/…/terms/`)이라 이미 위에 있고,
     정본이 남을 가리키는 주소를 지도에 또 적으면 지도가 스스로와 말이 어긋난다. */
  for (const route of everyRoute()) {
    const current = currentVersion(route.app, route.doc, route.locale);
    for (const version of listVersions(route.app, route.doc, route.locale)) {
      if (version.status !== "published") continue;
      if (version.version === current?.version) continue;
      entries.push({
        url: at(versionPath(route.locale, route.app, route.doc, version.version)),
        changeFrequency: "yearly",
        priority: 0.3,
      });
    }
  }

  return entries;
}
