import Link from "next/link";
import type { AppMeta, DocMeta, VersionDoc } from "@/lib/content.mjs";
import { formatDate } from "@/lib/labels";
import { strings } from "@/lib/i18n";
import { appPath, docPath, versionPath } from "@/lib/site";
import Markdown from "./Markdown";
import styles from "./DocScreen.module.css";

/**
 * 약관 한 장.
 *
 * **문서의 언어가 화면의 언어를 정한다** — 영어 약관 위에 한국어 이름표가 서면
 * 그건 덜 옮긴 것이 아니라 읽을 수 없는 계약서를 건네는 일이다.
 * `<article lang>` 을 다는 것도 같은 이유다: 화면 낭독기가 이 글을 어느 말로 읽을지
 * 문서 전체의 이름표가 아니라 이 덩이의 이름표를 본다.
 */
export default function DocScreen({
  app,
  doc,
  version,
  locale,
  past,
  upcoming,
  isArchived = false,
}: {
  app: AppMeta;
  doc: DocMeta;
  version: VersionDoc;
  locale: string;
  /** 지난 판본들 — 현행 문서에서만 목록으로 선다. */
  past: VersionDoc[];
  /** 날짜만 기다리는 다음 판 — 있으면 미리 알린다. */
  upcoming: VersionDoc | null;
  /** 지금 보는 것이 현행이 아닌 지난 판인가. */
  isArchived?: boolean;
}) {
  const t = strings(locale);
  const kind = t.kinds[doc.kind] ?? t.kinds.custom;
  const languageName = new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale;

  return (
    <article className={styles.page} lang={locale}>
      <nav className={styles.crumb}>
        <Link href={appPath(locale, app.slug)}>{app.name}</Link>
      </nav>

      <header className={styles.head}>
        <p className={styles.kind}>{kind}</p>
        <h1 className={styles.title}>{version.title || doc.name}</h1>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>{t.effectiveOn}</dt>
            <dd>{formatDate(version.effectiveAt, locale)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{t.edition}</dt>
            <dd>{t.editionNo(version.version)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{t.language}</dt>
            <dd>{languageName}</dd>
          </div>
        </dl>
      </header>

      {/* 지난 판을 읽는 사람에게는 **현행으로 가는 문**을 먼저 준다. */}
      {isArchived ? (
        <p className={`${styles.notice} ${styles.noticePast}`}>
          {t.archivedNotice}{" "}
          <Link href={docPath(locale, app.slug, doc.slug)}>{t.currentOne(kind)}</Link>
        </p>
      ) : null}

      {!isArchived && upcoming ? (
        <p className={styles.notice}>
          {t.upcoming(formatDate(upcoming.effectiveAt, locale), upcoming.version)}
        </p>
      ) : null}

      {version.summary ? <p className={styles.summary}>{version.summary}</p> : null}

      <div className={styles.body}>
        <Markdown>{version.body}</Markdown>
      </div>

      {!isArchived && past.length > 0 ? (
        <section className={styles.history}>
          <h2 className={styles.historyTitle}>{t.pastVersions}</h2>
          <ul className={styles.historyList}>
            {past.map((old) => (
              <li key={old.version}>
                <Link
                  href={versionPath(locale, app.slug, doc.slug, old.version)}
                  className={styles.historyRow}
                >
                  <span>{t.editionNo(old.version)}</span>
                  <span className={styles.historyWhen}>
                    {t.effectiveSince(formatDate(old.effectiveAt, locale))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
