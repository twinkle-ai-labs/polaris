import Image from "next/image";
import Link from "next/link";
import { currentVersion, listDocs, publishedLocales, readApp, readSite } from "@/lib/content.mjs";
import { formatDate } from "@/lib/labels";
import { strings } from "@/lib/i18n";
import { docPath, localeHome } from "@/lib/site";
import styles from "./AppBody.module.css";

/**
 * 한 앱의 문서 목록.
 *
 * 요청한 언어에 아직 없는 문서는 **다른 언어의 것이라도 보여 준다** —
 * 「없음」보다 「남의 말로라도 있음」이 낫고, 약관은 있는데 못 찾는 일이 더 나쁘다.
 */
export default function AppBody({ app, locale }: { app: string; locale: string }) {
  const meta = readApp(app, locale);
  if (!meta) return null;

  const t = strings(locale);
  const defaultLocale = readSite().defaultLocale;

  const docs = listDocs(app).map((doc) => {
    const locales = publishedLocales(app, doc.slug);
    const primary =
      currentVersion(app, doc.slug, locale) ??
      (locales[0] ? currentVersion(app, doc.slug, locales[0]) : null);
    return { ...doc, primary };
  });
  const published = docs.filter((doc) => doc.primary);

  return (
    <section className={styles.page}>
      <nav className={styles.crumb}>
        <Link href={localeHome(locale, defaultLocale)}>{t.allApps}</Link>
      </nav>

      <div className={styles.intro}>
        {meta.icon ? (
          <Image className={styles.icon} src={meta.icon} alt="" width={112} height={112} />
        ) : null}
        <h1 className={styles.title}>{meta.name}</h1>
        {meta.description ? <p className={styles.lead}>{meta.description}</p> : null}
      </div>

      {published.length === 0 ? (
        <p className={styles.blank}>{t.nothingPublished}</p>
      ) : (
        <ul className={styles.list}>
          {published.map((doc) => (
            <li key={doc.slug}>
              <Link href={docPath(locale, app, doc.slug)} className={styles.row}>
                <span className={styles.rowMain}>
                  <span className={styles.rowKind}>{t.kinds[doc.kind] ?? t.kinds.custom}</span>
                  <span className={styles.rowName}>{doc.primary?.title || doc.name}</span>
                  <span className={styles.rowWhen}>
                    {doc.primary?.effectiveAt
                      ? t.effectiveSince(formatDate(doc.primary.effectiveAt, locale))
                      : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
