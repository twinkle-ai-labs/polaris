import LocaleSync from "@/components/LocaleSync";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { readSite } from "@/lib/content.mjs";
import { strings } from "@/lib/i18n";
import styles from "@/app/layout.module.css";

/**
 * 화면의 껍데기 — 머리와 발.
 *
 * 루트 레이아웃이 아니라 **페이지가 부른다.** 레이아웃은 라우트의 언어를 모르는데,
 * 껍데기의 말(«밝은 화면으로», 꼬리말의 한 줄 소개)은 언어를 따라야 하기 때문이다.
 * 한국어 약관을 열었는데 머리글만 영어면 그건 덜 옮긴 것이 아니라 **읽는 사람이
 * 어느 언어의 화면에 있는지 알 수 없게 만드는 일**이다.
 *
 * 사이트 자료와 말은 **여기서 한 번** 읽어 머리와 발에 나눠 준다 — 둘이 따로 읽으면
 * 같은 파일을 두 번 열고, 언젠가 한쪽만 다른 언어로 읽는다.
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
      <LocaleSync locale={locale} />
      <SiteHeader site={site} locale={locale} t={t} />
      <main className={styles.main}>{children}</main>
      <SiteFooter site={site} locale={locale} t={t} />
    </>
  );
}
