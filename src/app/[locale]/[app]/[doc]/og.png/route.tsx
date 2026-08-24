import { currentVersion, everyRoute, readApp, readSite } from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import { isDrawable, ogCard } from "@/lib/og";
import { DOMAIN } from "@/lib/seo";

/* 배포본은 서버가 없다 — 문서마다 한 장씩 빌드 때 구워진다. */
export const dynamic = "force-static";

/** 한 문서의 카드에 적힐 말 — 굽는 쪽과 «구울 수 있는가»를 세는 쪽이 같은 것을 본다.
    라우트 파일은 정해진 이름만 내보낼 수 있어 여기 두고 밖으로 내지 않는다. */
function cardWords(app: string, doc: string, locale: string) {
  const site = readSite(locale);
  const t = strings(locale);
  const appMeta = readApp(app, locale);
  const version = currentVersion(app, doc, locale);
  return {
    eyebrow: `${site.operator} · ${appMeta?.name ?? site.name}`,
    title: version?.title ?? t.navTerms,
    lead: version?.summary || appMeta?.description || site.tagline,
    domain: DOMAIN,
  };
}

/**
 * 문서가 서는 (앱, 문서, 언어)마다 카드도 한 장 — **글꼴이 그릴 수 있는 언어만**.
 *
 * 한자를 쓰는 언어(ja·zh)는 여기서 빠지고 보관소의 기본 카드로 물러선다.
 * 굽지 못할 것을 목록에 올리면 빌드가 두부 그림을 낳는다.
 */
export function generateStaticParams() {
  return everyRoute()
    .filter((route) => {
      const words = cardWords(route.app, route.doc, route.locale);
      return isDrawable(words.eyebrow, words.title, words.lead);
    })
    .map((route) => ({ locale: route.locale, app: route.app, doc: route.doc }));
}

/**
 * 문서 한 장의 나눔 카드 — 문서의 언어로, 문서의 제목을 말한다.
 *
 * 판본 장(v/N)은 제 카드를 굽지 않고 이 카드를 같이 쓴다 — 지난 판을 나눌 때도
 * 카드가 말할 것은 «어느 문서인가»지 «몇 판인가»가 아니다.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; app: string; doc: string }> },
) {
  const { locale, app, doc } = await params;
  return ogCard(cardWords(app, doc, locale));
}
