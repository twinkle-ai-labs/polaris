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
 * 머리띠 — 왼쪽에 브랜드, 가운데에 언어 고르개, 오른쪽에 메뉴 넷과 얼굴 바꾸는 버튼.
 *
 * 브랜드는 **운영자의 앞마당**으로 간다. 이 보관소의 이름(Polaris)과 운영자의 이름
 * (Twinkle AI Labs)은 다른 것이라, 머리띠에 서는 것은 운영자 쪽이다.
 *
 * 언어 고르개는 **가운데에 홀로 선다** (2026-10-26 · Founder). 다른 사이트의 머리띠는
 * 「브랜드 — 메뉴 · 테마」두 덩이인데, 여기만 메뉴 줄 끝에 넓은 알약이 하나 더 끼어
 * 머리띠가 달라 보였다. 고르개를 테마 단추 크기로 줄여 오른쪽에 두는 안도 봤지만,
 * 언어는 이 사이트 전체를 바꾸는 하나뿐인 설정이라 메뉴 사이에 섞지 않고 제 자리를 준다.
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
        <div className={styles.headerCenter}>
          <HeaderLocaleSelect
            locales={LOCALES}
            current={locale}
            defaultLocale={site.defaultLocale}
            label={t.pickLanguage}
          />
        </div>
        <HeaderNavigation
          links={links}
          label={t.mainNav}
          openLabel={t.openMenu}
          closeLabel={t.closeMenu}
        >
          <ThemeToggle toLight={t.toLight} toDark={t.toDark} />
        </HeaderNavigation>
      </div>
    </HeaderBar>
  );
}
