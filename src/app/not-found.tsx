import Link from "next/link";
import { readSite } from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import styles from "./not-found.module.css";

/* 없는 곳은 목록에 올리지 않는다 — 404 가 검색 결과에 서면 찾아온 사람이 처음부터 빈손이다. */
export const metadata = { robots: { index: false, follow: true } };

export default function NotFound() {
  const t = strings(readSite().defaultLocale);
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t.notFoundTitle}</h1>
      <p className={styles.body}>{t.notFoundBody}</p>
      <Link href="/" className={styles.cta}>
        {t.notFoundCta}
      </Link>
    </div>
  );
}
