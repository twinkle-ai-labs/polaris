import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import Aurora from "@/components/Aurora";
import RouteViews from "@/components/RouteViews";
import Providers from "@/components/Providers";
import { readSite } from "@/lib/content.mjs";
import "./globals.css";

const site = readSite();

export const metadata: Metadata = {
  title: { default: `${site.name} — 약관`, template: `%s · ${site.name}` },
  description: site.tagline || "여러 앱의 약관을 한 곳에서 기르고 뿌린다.",
};

// 화면이 그려지기 전에 테마를 정한다 — 쿠키를 먼저 읽어 서브도메인 간 동기화하고, 없으면 localStorage를 본다.
const themeBoot = `(function(){try{var m=document.cookie.match(/(?:^|; )twinkle-theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

/*
 * 루트 레이아웃은 **그릇만** 든다.
 *
 * 머리와 발은 [Chrome] 이 그린다 — 레이아웃은 라우트의 언어를 모르는데 껍데기의 말은
 * 언어를 따라야 하기 때문이다. 여기 남는 것은 어느 언어에서나 같은 것뿐이다:
 * 글꼴, 테마를 먼저 정하는 한 줄, 그리고 문서의 뼈대.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.defaultLocale} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
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
