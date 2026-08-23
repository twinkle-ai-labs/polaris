import Image from "next/image";
import Link from "next/link";
import { currentVersion, listDocs, publishedLocales, readApp } from "@/lib/content.mjs";
import { formatDate } from "@/lib/labels";
import { strings } from "@/lib/i18n";
import HtmlLang from "@/components/HtmlLang";
import styles from "./AppBody.module.css";

export default function AppBody({ app, locale }: { app: string; locale: string }) {
  const meta = readApp(app, locale);
  if (!meta) return null;
  const docs = listDocs(app).map((doc) => {
    const locales = publishedLocales(app, doc.slug);
    const primary = currentVersion(app, doc.slug, locale) ??
      (locales[0] ? currentVersion(app, doc.slug, locales[0]) : null);
    return { ...doc, primary };
  });
  const live = docs.filter((doc) => doc.primary);
  const t = strings(locale);

  return (
    <section className={styles.page}>
      <HtmlLang locale={locale} />
      <nav className={styles.crumb}><Link href={locale === "ko" ? "/" : `/${locale}/`}>{t.allApps}</Link></nav>
      <div className={styles.intro}>
        {meta.icon ? <Image className={styles.icon} src={meta.icon} alt="" width={112} height={112} /> : null}
        <h1 className={styles.title}>{meta.name}</h1>
        {meta.description ? <p className={styles.lead}>{meta.description}</p> : null}
      </div>
      {live.length === 0 ? <p className={styles.blank}>{t.nothingPublished}</p> : (
        <ul className={styles.list}>
          {live.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/${locale}/${app}/${doc.slug}/`} className={styles.row}>
                <span className={styles.rowMain}>
                  <span className={styles.rowKind}>{t.kinds[doc.kind] ?? t.kinds.custom}</span>
                  <span className={styles.rowName}>{doc.primary?.title || doc.name}</span>
                  <span className={styles.rowWhen}>{doc.primary?.effectiveAt ? t.effectiveSince(formatDate(doc.primary.effectiveAt, locale)) : ""}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
