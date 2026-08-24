import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listApps, readApp, readSite } from "@/lib/content.mjs";
import { LOCALES } from "@/lib/labels";
import { appAlternates, shareCard } from "@/lib/seo";
import { appPath } from "@/lib/site";
import Chrome from "@/components/Chrome";
import AppBody from "@/components/AppBody";

type AppParams = { locale: string; app: string };

function isSupportedLocale(locale: string): boolean {
  return LOCALES.some((item) => item.value === locale);
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    listApps().map((app) => ({ locale: locale.value, app: app.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<AppParams>;
}): Promise<Metadata> {
  const { locale, app } = await params;
  const site = readSite(locale);
  const meta = readApp(app, locale);
  const title = meta ? `${meta.name} — ${site.name}` : site.name;
  /* 앱의 한 줄 소개가 곧 이 장의 설명이다 — 없으면 보관소의 것으로 물러선다.
     설명 없는 장은 검색 결과에서 첫 문단이 잘려 나온다. */
  const description = meta?.description || site.tagline;
  return {
    title: { absolute: title },
    description,
    alternates: appAlternates(locale, app),
    ...shareCard({ title, description, path: appPath(locale, app), locale }),
  };
}

/** 한 앱의 문서 목록 — 언어마다 한 장. */
export default async function AppPage({ params }: { params: Promise<AppParams> }) {
  const { locale, app } = await params;
  if (!isSupportedLocale(locale)) notFound();
  if (!readApp(app, locale)) notFound();

  return (
    <Chrome locale={locale}>
      <AppBody app={app} locale={locale} />
    </Chrome>
  );
}
