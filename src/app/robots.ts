import type { MetadataRoute } from "next";
import { POLARIS_URL } from "@/lib/seo";

/**
 * 기어다니는 것들에게 하는 말.
 *
 * 편집기(`/admin`)는 배포본에 실리지 않는다(`*.dev.tsx` 라 확장자 목록에서 빠진다) —
 * 그래도 막아 두는 것은, 언젠가 실리게 되는 날 «robots 도 같이 고쳐야 한다»를
 * 아무도 기억하지 못하기 때문이다. 없는 길을 막는 것은 값이 들지 않는다.
 */

/* 배포본은 서버가 없다 — 이 파일은 빌드 때 한 번 구워져 정적 파일로 남는다. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
    sitemap: `${POLARIS_URL}/sitemap.xml`,
    host: POLARIS_URL,
  };
}
