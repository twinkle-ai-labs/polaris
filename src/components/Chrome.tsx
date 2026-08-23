import Link from "next/link";
import { readSite } from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import { LOCALES } from "@/lib/labels";
import StarMark from "@/components/StarMark";
import Starfield from "@/components/Starfield";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderBar from "@/components/HeaderBar";
import styles from "@/app/layout.module.css";

/**
 * 화면의 껍데기 — 머리와 발.
 *
 * 루트 레이아웃이 아니라 **페이지가 부른다.** 레이아웃은 라우트의 언어를 모르는데,
 * 껍데기의 말(«밝은 화면으로», 꼬리말의 한 줄 소개)은 언어를 따라야 하기 때문이다.
 * 한국어 약관을 열었는데 머리글만 영어면 그건 덜 옮긴 것이 아니라 **읽는 사람이
 * 어느 언어의 화면에 있는지 알 수 없게 만드는 일**이다.
 */
export default function Chrome({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const site = readSite(locale);
  const t = strings(locale);

  return (
    <>
      <HeaderBar>
        <div className={styles.headerInner}>
          <a href="https://twinklelabs.kr/" className={styles.brand}>
            <StarMark gradientId="twinkle-brand" className={styles.star} />
            <span className={styles.brandName}>{site.operator || site.name}</span>
          </a>
          <nav className={styles.nav} aria-label={locale === "ko" ? "주요 메뉴" : "Main navigation"}>
            <a href="https://twinklelabs.kr/" className={styles.navLink}>
              {t.navHome}
            </a>
            <a href="https://design.twinklelabs.kr/" className={styles.navLink}>
              {t.navDesign}
            </a>
            <a href="https://blog.twinklelabs.kr/" className={styles.navLink}>
              {t.navBlog}
            </a>
            <Link href={locale === site.defaultLocale ? "/" : `/${locale}/`} className={`${styles.navLink} ${styles.navLinkActive}`} aria-current="page">
              {t.navTerms}
            </Link>
            <ThemeToggle toLight={t.toLight} toDark={t.toDark} />
          </nav>
        </div>
      </HeaderBar>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        {/* 바닥에도 하늘 한 자락 — 첫 화면과 마지막 화면이 같은 말로 끝난다. */}
        <Starfield
          seed={19910104}
          height="100%"
          dots={24}
          sparkles={3}
          className={styles.footerSky}
        />
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <p className={styles.footerName}><StarMark className={styles.footerStar} />{site.name}</p>
              {site.tagline ? <p className={styles.footerLine}>{site.tagline}</p> : null}
            </div>
            <nav className={styles.footerColumn} aria-label={t.pickLanguage}>
              <p className={styles.footerHeading}>{t.pickLanguage}</p>
              <div className={styles.footerLocales}>
                {LOCALES.map((l) => (
                  <Link key={l.value} href={l.value === site.defaultLocale ? "/" : `/${l.value}/`} hrefLang={l.value} lang={l.value} className={styles.footerLink} aria-current={l.value === locale ? "true" : undefined}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className={styles.footerColumn}>
              <p className={styles.footerHeading}>{locale === "ko" ? "운영 및 문의" : "Operator & contact"}</p>
              <p className={styles.footerOperator}>
                {site.operator ? <span className={styles.operatorName}>{site.operator}</span> : null}
                {site.contactEmail ? <a href={`mailto:${site.contactEmail}`} className={styles.footerLink}>{site.contactEmail}</a> : null}
              </p>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>© 2026 {site.operator || site.name}</p>
            <p className={styles.footerMotto}>{site.name}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
