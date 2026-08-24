import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readSite } from "@/lib/content.mjs";
import { LOCALES } from "@/lib/labels";
import { homeAlternates, shareCard } from "@/lib/seo";
import { localeHome } from "@/lib/site";
import Chrome from "@/components/Chrome";
import HomeBody from "@/components/HomeBody";

type LocaleParams = { locale: string };

/**
 * 언어별 홈.
 *
 * 기본 언어는 `/` 가 이미 그리므로 여기서 빼 둔다 — 같은 화면이 두 주소에 서면
 * 검색 엔진이 어느 쪽을 정본으로 볼지 스스로 정하고, 그 선택을 우리가 못 본다.
 */
export function generateStaticParams() {
  const { defaultLocale } = readSite();
  return LOCALES.filter((locale) => locale.value !== defaultLocale).map((locale) => ({
    locale: locale.value,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = readSite(locale);
  const title = `${site.name} — ${site.operator}`;
  return {
    title: { absolute: title },
    description: site.tagline,
    alternates: homeAlternates(locale),
    ...shareCard({
      title,
      description: site.tagline,
      path: localeHome(locale, site.defaultLocale),
      locale,
    }),
  };
}

export default async function LocaleHomePage({ params }: { params: Promise<LocaleParams> }) {
  const { locale } = await params;
  if (!LOCALES.some((item) => item.value === locale)) notFound();

  return (
    <Chrome locale={locale}>
      <HomeBody locale={locale} />
    </Chrome>
  );
}
