import Link from "next/link";
import StarMark from "@/components/StarMark";
import Starfield from "@/components/Starfield";
import type { Site } from "@/lib/content.mjs";
import type { Strings } from "@/lib/i18n";
import { navLinks } from "@/lib/site";
import styles from "@/app/layout.module.css";

/** 바닥에도 하늘 한 자락 — 첫 화면과 마지막 화면이 같은 말로 끝난다. */
const FOOTER_SKY_SEED = 19910104;

export default function SiteFooter({
  site,
  locale,
  t,
}: {
  site: Site;
  locale: string;
  t: Strings;
}) {
  const links = navLinks(t, locale, site.defaultLocale);

  return (
    <footer className={styles.footer}>
      <Starfield
        seed={FOOTER_SKY_SEED}
        height="100%"
        dots={24}
        sparkles={3}
        className={styles.footerSky}
      />
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <p className={styles.footerName}>
              <StarMark className={styles.footerStar} />
              {site.name}
            </p>
            {site.tagline ? <p className={styles.footerLine}>{site.tagline}</p> : null}
          </div>
          {/* 머리띠와 **같은 목록**을 읽는다 — 메뉴가 하나 늘면 두 곳이 함께 는다. */}
          <nav className={styles.footerColumn} aria-label={t.footerNav}>
            <p className={styles.footerHeading}>{t.footerNav}</p>
            <div className={styles.footerLinks}>
              {links.map((link) =>
                link.isInternal ? (
                  <Link key={link.key} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.key} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </nav>
          <div className={styles.footerColumn}>
            <p className={styles.footerHeading}>{t.footerContact}</p>
            <p className={styles.footerOperator}>
              {site.operator ? <span className={styles.operatorName}>{site.operator}</span> : null}
              {site.contactEmail ? (
                <a href={`mailto:${site.contactEmail}`} className={styles.footerLink}>
                  {site.contactEmail}
                </a>
              ) : null}
            </p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>© 2026 {site.operator || site.name}</p>
          <p className={styles.footerMotto}>{site.name}</p>
        </div>
      </div>
    </footer>
  );
}
