import Link from "next/link";
import HeaderBar from "@/components/HeaderBar";
import HeaderLocaleSelect from "@/components/HeaderLocaleSelect";
import StarMark from "@/components/StarMark";
import ThemeToggle from "@/components/ThemeToggle";
import type { Site } from "@/lib/content.mjs";
import type { Strings } from "@/lib/i18n";
import { LOCALES } from "@/lib/labels";
import { CURRENT_NAV_KEY, HOME_URL, navLinks } from "@/lib/site";
import styles from "@/app/layout.module.css";

/**
 * 머리띠 — 브랜드 하나, 메뉴 넷, 언어 고르개, 얼굴 바꾸는 버튼.
 *
 * 브랜드는 **운영자의 앞마당**으로 간다. 이 보관소의 이름(Polaris)과 운영자의 이름
 * (Twinkle AI Labs)은 다른 것이라, 머리띠에 서는 것은 운영자 쪽이다.
 */
export default function SiteHeader({
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
    <HeaderBar>
      <div className={styles.headerInner}>
        <a href={HOME_URL} className={styles.brand}>
          <StarMark gradientId="twinkle-brand" className={styles.star} />
          <span className={styles.brandName}>{site.operator || site.name}</span>
        </a>
        <nav className={styles.nav} aria-label={t.mainNav}>
          {links.map((link) => {
            const isCurrent = link.key === CURRENT_NAV_KEY;
            const className = `${styles.navLink} ${isCurrent ? styles.navLinkActive : ""}`;
            /* 이 집 안의 길은 화면만 갈아 끼운다 — 밖으로 나가는 문만 문서를 새로 연다. */
            return link.isInternal ? (
              <Link
                key={link.key}
                href={link.href}
                className={className}
                aria-current={isCurrent ? "page" : undefined}
              >
                {link.label}
              </Link>
            ) : (
              <a key={link.key} href={link.href} className={className}>
                {link.label}
              </a>
            );
          })}
          <HeaderLocaleSelect
            locales={LOCALES}
            current={locale}
            defaultLocale={site.defaultLocale}
            label={t.pickLanguage}
          />
          <ThemeToggle toLight={t.toLight} toDark={t.toDark} />
        </nav>
      </div>
    </HeaderBar>
  );
}
