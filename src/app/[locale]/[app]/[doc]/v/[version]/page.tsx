import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  currentVersion,
  everyRoute,
  listVersions,
  readApp,
  readDoc,
  readVersion,
} from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import { docOgImage, shareCard, versionAlternates } from "@/lib/seo";
import { versionPath } from "@/lib/site";
import Chrome from "@/components/Chrome";
import DocScreen from "@/components/DocScreen";

type VersionParams = { app: string; doc: string; locale: string; version: string };

/**
 * 판본마다 제 주소를 준다 — 지난 것을 읽으러도 오고,
 * 앱이 «이 판본에 동의했다»를 가리킬 때도 이 주소를 쓴다.
 *
 * 초안은 굽지 않는다: 아직 아무에게도 보이지 않기로 한 글이다.
 */
export function generateStaticParams() {
  return everyRoute().flatMap((route) =>
    listVersions(route.app, route.doc, route.locale)
      .filter((version) => version.status === "published")
      .map((version) => ({ ...route, version: String(version.version) })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<VersionParams>;
}): Promise<Metadata> {
  const { app, doc, locale, version } = await params;
  const t = strings(locale);
  const no = Number(version);
  const found = readVersion(app, doc, locale, no);
  const meta = readApp(app, locale);
  const title = found ? `${found.title} (${t.editionNo(found.version)})` : t.navTerms;
  const description = found?.summary || meta?.description || "";
  const isCurrent = currentVersion(app, doc, locale)?.version === no;
  return {
    title: { absolute: title },
    description,
    alternates: versionAlternates(locale, app, doc, no, isCurrent),
    ...shareCard({
      title,
      description,
      path: versionPath(locale, app, doc, no),
      locale,
      /* 판본은 제 카드를 굽지 않는다 — 문서의 카드를 같이 쓴다. */
      image: docOgImage(locale, app, doc, meta?.name, found?.title, description),
    }),
  };
}

export default async function VersionPage({ params }: { params: Promise<VersionParams> }) {
  const { app, doc, locale, version } = await params;
  const appMeta = readApp(app, locale);
  const docMeta = readDoc(app, doc);
  const found = readVersion(app, doc, locale, Number(version));
  if (!appMeta || !docMeta || !found || found.status !== "published") notFound();

  const current = currentVersion(app, doc, locale);

  return (
    <Chrome locale={locale}>
      <DocScreen
        app={appMeta}
        doc={docMeta}
        version={found}
        locale={locale}
        /* 지난 판을 읽는 자리에서는 이력을 또 늘어놓지 않는다 — 현행으로 가는 문 하나면 된다. */
        past={[]}
        upcoming={null}
        isArchived={current?.version !== found.version}
      />
    </Chrome>
  );
}
