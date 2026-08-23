import { notFound } from "next/navigation";
import { listApps, readApp, readSite } from "@/lib/content.mjs";
import { LOCALES } from "@/lib/labels";
import Chrome from "@/components/Chrome";
import AppBody from "@/components/AppBody";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => listApps().map((app) => ({ locale: locale.value, app: app.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; app: string }> }) {
  const { locale, app } = await params;
  const meta = readApp(app, locale);
  return { title: meta ? `${meta.name} — ${readSite(locale).name}` : "Polaris" };
}

export default async function LocalizedAppPage({ params }: { params: Promise<{ locale: string; app: string }> }) {
  const { locale, app } = await params;
  if (!LOCALES.some((item) => item.value === locale)) notFound();
  const meta = readApp(app, locale);
  if (!meta) notFound();
  return <Chrome locale={locale}><AppBody app={app} locale={locale} /></Chrome>;
}
