import { readSite } from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import { ogCard } from "@/lib/og";
import { DOMAIN } from "@/lib/seo";

/* 배포본은 서버가 없다 — 이 그림은 빌드 때 한 번 구워져 정적 파일로 남는다. */
export const dynamic = "force-static";

/**
 * 보관소의 나눔 카드 — 홈·앱 목록이 쓴다. 문서는 저마다 제 카드를 굽는다.
 *
 * 카드는 기본 언어로 선다: 그림은 한 장인데 언어는 열한 벌이라, 어느 하나를
 * 골라야 한다면 보관소가 제 기본이라 정한 언어가 그 하나다.
 */
export function GET() {
  const site = readSite();
  const t = strings(site.defaultLocale);
  return ogCard({
    eyebrow: `${site.name} · ${site.operator}`,
    title: t.heroTitle,
    lead: site.tagline,
    domain: DOMAIN,
  });
}
