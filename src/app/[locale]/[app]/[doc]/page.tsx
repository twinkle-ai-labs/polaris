import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  currentVersion,
  everyRoute,
  pastVersions,
  readApp,
  readDoc,
  readSite,
  upcomingVersion,
} from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import { docAlternates, docOgImage, shareCard } from "@/lib/seo";
import { docPath } from "@/lib/site";
import Chrome from "@/components/Chrome";
import DocScreen from "@/components/DocScreen";

type DocParams = { app: string; doc: string; locale: string };

/** 정적으로 구울 (앱, 문서, 언어) 조합 — 펴낸 것만. */
export function generateStaticParams() {
  return everyRoute();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DocParams>;
}): Promise<Metadata> {
  const { app, doc, locale } = await params;
  const version = currentVersion(app, doc, locale);
  const meta = readApp(app, locale);
  const t = strings(locale);
  /* 제목도 문서의 언어를 따른다 — 못 찾았을 때의 말까지. */
  const title = version && meta ? `${version.title} — ${meta.name}` : t.navTerms;
  /* 약관의 첫 줄 요약이 곧 검색 결과의 설명이다 — 본문 첫 문단(«제1조 (목적)»)이
     잘려 나오는 것보다 사람이 쓴 한 줄이 낫다. */
  const description = version?.summary || meta?.description || readSite(locale).tagline;
  return {
    title: { absolute: title },
    description,
    alternates: docAlternates(locale, app, doc),
    ...shareCard({
      title,
      description,
      path: docPath(locale, app, doc),
      locale,
      image: docOgImage(locale, app, doc, meta?.name, version?.title, description),
    }),
  };
}

/** 한 문서의 **현행** 판. */
export default async function DocPage({ params }: { params: Promise<DocParams> }) {
  const { app, doc, locale } = await params;
  const appMeta = readApp(app, locale);
  const docMeta = readDoc(app, doc);
  const version = currentVersion(app, doc, locale);
  if (!appMeta || !docMeta || !version) notFound();

  return (
    <Chrome locale={locale}>
      <DocScreen
        app={appMeta}
        doc={docMeta}
        version={version}
        locale={locale}
        past={pastVersions(app, doc, locale)}
        upcoming={upcomingVersion(app, doc, locale)}
      />
    </Chrome>
  );
}
