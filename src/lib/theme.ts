/**
 * 테마 — 브라우저에 손대는 유일한 자리.
 *
 * 상태는 Redux 가 진다(`store/themeSlice`). 이 파일은 그 상태를 **바깥 세계**와 잇는
 * 좁은 문이다 — 쿠키 한 칸, `data-theme` 속성 하나, 그리고 첫 그림 전에 도는 한 줄.
 * 컴포넌트가 `document` 를 직접 만지지 않게 하려고 모아 둔 것이라, 여기 없는 손은 없다.
 *
 * 쿠키인 이유: 홈·디자인·약관이 서로 다른 서브도메인에 산다. `localStorage` 는 도메인마다
 * 따로라서 한쪽에서 고른 얼굴이 다른 쪽에서 되살아나지 않는다.
 */

export type Theme = "light" | "dark";

/** 세 서브도메인이 함께 읽는 칸. 이름을 바꾸면 셋을 같이 바꾼다. */
const COOKIE_NAME = "twinkle-theme";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
/** 우리 것이 아닌 주소에는 쿠키를 넓게 걸지 않는다 — 로컬에서는 이 호스트 하나로 족하다. */
const SHARED_DOMAIN = ".twinklelabs.kr";
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function cookieDomain(hostname: string): string {
  const isLocal = LOCAL_HOSTS.includes(hostname) || hostname.endsWith(".localhost");
  return isLocal ? "" : `; domain=${SHARED_DOMAIN}`;
}

/** 지난번에 고른 얼굴. 고른 적이 없으면 null — 그때는 기기의 취향을 묻는다. */
export function readStoredTheme(): Theme | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return isTheme(value) ? value : null;
}

/** 사용자가 **고른** 것만 남긴다 — 기기의 취향을 베껴 적으면 취향이 바뀌어도 따라가지 못한다. */
export function writeStoredTheme(theme: Theme): void {
  const domain = cookieDomain(window.location.hostname);
  document.cookie =
    `${COOKIE_NAME}=${theme}${domain}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/** 화면에 입힌다. CSS 는 `[data-theme]` 하나만 보므로 여기가 유일한 붓이다. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

/** 고른 적이 없을 때의 기본 — 기기가 이미 답을 갖고 있다. */
export function preferredTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * 첫 그림 **전에** 도는 한 줄.
 *
 * React 가 붙기를 기다리면 어두운 화면을 고른 사람이 흰 화면을 한 번 보고 만다 —
 * 그 깜빡임은 «느린 사이트»가 아니라 «고른 것이 안 지켜지는 사이트»로 읽힌다.
 * 그래서 이 한 줄만은 Redux 밖에서, `<head>` 안에서 먼저 돈다.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${COOKIE_NAME}=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;
