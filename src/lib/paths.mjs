/**
 * 이 보관소 안의 길 — 앱 · 문서 · 판본의 주소를 짓는 **한 자리**.
 *
 * 화면(`site.ts` 가 다시 내보낸다)과 빌드 뒤 스크립트(`emit-api.mjs` · `emit-legacy.mjs`)가
 * 같은 함수를 부른다. 스크립트는 Node 가 그대로 돌리므로 `.ts` 를 읽지 못해 이 파일은 `.mjs` 다.
 *
 * ↩ 2026-08-24 에 주소를 로케일 우선(`/{locale}/{app}/…`)으로 옮길 때 화면의 길은 `site.ts` 에
 * 새로 섰는데, API 를 굽는 스크립트는 제 손으로 `/t/…` 를 이어 붙이고 있었다. 두 벌이었으니
 * 한쪽만 옮겨졌고, API 는 보름 동안 걷힌 주소를 실어 보냈다 — 앱이 그 링크를 보여 주면 404 였다.
 */

/** 한 앱의 문서 목록. */
export function appPath(locale, app) {
  return `/${locale}/${app}/`;
}

/** 한 문서의 현행 판. */
export function docPath(locale, app, doc) {
  return `/${locale}/${app}/${doc}/`;
}

/** 한 문서의 특정 판본 — 앱이 «이 판본에 동의했다»를 가리킬 때도 이 주소를 쓴다. */
export function versionPath(locale, app, doc, version) {
  return `/${locale}/${app}/${doc}/v/${version}/`;
}
