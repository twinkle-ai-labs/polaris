import type { Metadata, Viewport } from "next";
import Analytics from "@/components/Analytics";
import Aurora from "@/components/Aurora";
import Providers from "@/components/Providers";
import RouteViews from "@/components/RouteViews";
import { readSite } from "@/lib/content.mjs";
import { POLARIS_URL, jsonLd, shareCard } from "@/lib/seo";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

/** Pretendard — 굵기는 «가진 넷»만 부른다. 없는 굵기는 브라우저가 흉내 내거나 이웃 칸으로 스냅한다. */
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

const site = readSite();

const DESCRIPTION = site.tagline || "여러 앱의 약관을 한 곳에서 기르고 뿌린다.";

export const metadata: Metadata = {
  /* 주소의 뿌리 — 이걸 못 박아야 각 장이 «/ko/…» 한 줄만 적고도 정본 주소를 온전히 낸다. */
  metadataBase: new URL(POLARIS_URL),
  title: { default: `${site.name} — 약관`, template: `%s · ${site.name}` },
  description: DESCRIPTION,
  publisher: site.operator,
  applicationName: site.name,
  ...shareCard({
    title: `${site.name} — 약관`,
    description: DESCRIPTION,
    path: "/",
    locale: site.defaultLocale,
  }),
  robots: {
    index: true,
    follow: true,
    /* 검색 결과의 미리보기를 우리가 줄이지 않는다 — 기본값은 짧게 자르는 쪽이다. */
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * 루트 레이아웃은 **그릇만** 든다.
 *
 * 머리와 발은 [Chrome] 이 그린다 — 레이아웃은 라우트의 언어를 모르는데 껍데기의 말은
 * 언어를 따라야 하기 때문이다. 여기 남는 것은 어느 언어에서나 같은 것뿐이다:
 * 글꼴, 테마를 먼저 정하는 한 줄, 그리고 문서의 뼈대.
 *
 * `lang` 은 사이트 기본 언어로 나가고, 화면이 서면 실제 문서의 언어로 고쳐진다
 * (`store/effects`). 정적으로 구운 HTML 은 이 레이아웃 한 벌을 함께 쓰기 때문이다.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.defaultLocale} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={PRETENDARD_CSS} />
        {/* 첫 그림 전에 얼굴을 정한다 — React 를 기다리면 어두운 화면을 고른 사람이 흰 화면을 한 번 본다. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* 기계가 읽는 표 — 이 보관소가 무엇이고 누가 운영하는지를 한 번 말한다. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
        <Analytics />
      </head>
      <body>
        <Providers>
          <RouteViews />
          {/* 하늘은 어느 언어의 화면에나 걸린다 — 껍데기의 말과 달리 언어를 타지 않는다. */}
          <Aurora />
          {children}
        </Providers>
      </body>
    </html>
  );
}
