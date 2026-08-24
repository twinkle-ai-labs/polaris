import type { Metadata } from "next";
import { readSite } from "@/lib/content.mjs";
import { homeAlternates, shareCard } from "@/lib/seo";
import Chrome from "@/components/Chrome";
import HomeBody from "@/components/HomeBody";

export function generateMetadata(): Metadata {
  const site = readSite();
  return {
    title: { absolute: `${site.name} — ${site.operator}` },
    description: site.tagline,
    /* 기본 언어의 홈은 `/` 하나다 — `/ko/` 는 굽지 않는다. 그래도 hreflang 은
       열한 언어를 모두 세운다: 남의 언어 화면에서 이 언어로 오는 길이 여기다. */
    alternates: homeAlternates(site.defaultLocale),
    ...shareCard({
      title: `${site.name} — ${site.operator}`,
      description: site.tagline,
      path: "/",
      locale: site.defaultLocale,
    }),
  };
}

/** 기본 언어의 홈. 다른 언어는 `/<언어>/` 가 같은 것을 그린다. */
export default function HomePage() {
  const { defaultLocale } = readSite();
  return (
    <Chrome locale={defaultLocale}>
      <HomeBody locale={defaultLocale} />
    </Chrome>
  );
}
