import { notFound } from "next/navigation";
import {
  currentVersion,
  everyRoute,
  pastVersions,
  readApp,
  readDoc,
  upcomingVersion,
} from "@/lib/content.mjs";
import Chrome from "@/components/Chrome";
import DocScreen from "@/components/DocScreen";

export function generateStaticParams() {
  return everyRoute();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ app: string; doc: string; locale: string }>;
}) {
  const { app, doc, locale } = await params;
  const version = currentVersion(app, doc, locale);
  const meta = readApp(app, locale);
  return { title: version && meta ? `${version.title} — ${meta.name}` : "약관" };
}

export default async function DocLocalePage({
  params,
}: {
  params: Promise<{ app: string; doc: string; locale: string }>;
}) {
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
