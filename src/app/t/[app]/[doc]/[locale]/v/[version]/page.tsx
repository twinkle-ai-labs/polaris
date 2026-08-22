import { notFound } from "next/navigation";
import {
  currentVersion,
  everyRoute,
  listVersions,
  publishedLocales,
  readApp,
  readDoc,
  readVersion,
} from "@/lib/content.mjs";
import Chrome from "@/components/Chrome";
import DocScreen from "@/components/DocScreen";

/**
 * 판본마다 제 주소를 준다 — 지난 것을 읽으러도 오고,
 * 앱이 «이 판본에 동의했다»를 가리킬 때도 이 주소를 쓴다.
 */
export function generateStaticParams() {
  const out: { app: string; doc: string; locale: string; version: string }[] = [];
  for (const route of everyRoute())
    for (const v of listVersions(route.app, route.doc, route.locale))
      if (v.status === "published") out.push({ ...route, version: String(v.version) });
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ app: string; doc: string; locale: string; version: string }>;
}) {
  const { app, doc, locale, version } = await params;
  const found = readVersion(app, doc, locale, Number(version));
  return { title: found ? `${found.title} (제 ${found.version} 판)` : "약관" };
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ app: string; doc: string; locale: string; version: string }>;
}) {
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
        locales={publishedLocales(app, doc)}
        past={[]}
        upcoming={null}
        archived={current?.version !== found.version}
      />
    </Chrome>
  );
}
