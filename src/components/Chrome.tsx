import Link from "next/link";
import { readSite } from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import { LOCALES } from "@/lib/labels";
import StarMark from "@/components/StarMark";
import Starfield from "@/components/Starfield";
import ThemeToggle from "@/components/ThemeToggle";
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
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="https://twinklelabs.kr/" className={styles.brand}>
            <StarMark gradientId="twinkle-brand" className={styles.star} />
            <span className={styles.brandName}>{site.operator || site.name}</span>
          </a>
          <nav className={styles.nav}>
            <a href="https://twinklelabs.kr/" className={styles.navLink}>
              {t.navHome}
            </a>
            <a href="https://design.twinklelabs.kr/" className={styles.navLink}>
              {t.navDesign}
            </a>
            <a href="https://blog.twinklelabs.kr/" className={styles.navLink}>
              {t.navBlog}
            </a>
            <Link href={locale === site.defaultLocale ? "/" : `/${locale}/`} className={`${styles.navLink} ${styles.navLinkActive}`}>
              {t.navTerms}
            </Link>
            <ThemeToggle toLight={t.toLight} toDark={t.toDark} />
          </nav>
        </div>
      </header>
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
          <p className={styles.footerLine}>
            {site.name}
            {site.tagline ? ` — ${site.tagline}` : ""}
          </p>
          {/*
            언어 고르기는 꼬리말에 둔다. 이 사이트에서 언어는 «지금 할 일»이 아니라
            «안 맞으면 바꾸는 것»이라 머리에서 자리를 차지할 이유가 없다.
          */}
          <nav className={styles.footerLocales} aria-label={t.pickLanguage}>
            {LOCALES.map((l) => (
              <Link
                key={l.value}
                href={l.value === site.defaultLocale ? "/" : `/${l.value}/`}
                hrefLang={l.value}
                lang={l.value}
                className={styles.footerLink}
                aria-current={l.value === locale ? "true" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {/* 이 집의 이름은 Polaris 이고, 그것을 운영하는 이름은 따로 있다.
              약관이 «운영자»라고 부르는 쪽을 바닥에서 한 번 밝혀 둔다. */}
          <p className={styles.footerOperator}>
            {site.operator ? <span className={styles.operatorName}>{site.operator}</span> : null}
            {site.contactEmail ? (
              <a href={`mailto:${site.contactEmail}`} className={styles.footerLink}>
                {site.contactEmail}
              </a>
            ) : null}
          </p>
        </div>
      </footer>
    </>
  );
}
