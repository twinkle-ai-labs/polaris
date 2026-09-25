import HeaderBar from "@/components/HeaderBar";
import HeaderLocaleSelect from "@/components/HeaderLocaleSelect";
import HeaderNavigation from "@/components/HeaderNavigation";
import StarMark from "@/components/StarMark";
import ThemeToggle from "@/components/ThemeToggle";
import type { Site } from "@/lib/content.mjs";
import type { Strings } from "@/lib/i18n";
import { LOCALES } from "@/lib/labels";
import { HOME_URL, navLinks } from "@/lib/site";
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
        <HeaderNavigation links={links} label={t.mainNav} openLabel={t.openMenu} closeLabel={t.closeMenu}>
          <HeaderLocaleSelect
            locales={LOCALES}
            current={locale}
            defaultLocale={site.defaultLocale}
            label={t.pickLanguage}
          />
          <ThemeToggle toLight={t.toLight} toDark={t.toDark} />
        </HeaderNavigation>
      </div>
    </HeaderBar>
  );
}
