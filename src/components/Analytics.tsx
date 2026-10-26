/*
 * GA4 — 광고 칸은 닫고, 통계 칸만 연다 (2026-10-22 · Founder «GA 정상화»).
 *
 * 2026-10-22 까지는 네 칸을 전부 denied 로 못 박았다. 그러면 gtag 는 쿠키 없는 핑만 보내는데,
 * GA4 는 그 핑을 **보고서에 싣지 않는다** — 사용자도 페이지뷰도 0 이었다(Observatory 에서 봤다).
 * 그래서 analytics_storage 하나만 granted 로 돌린다: GA4 의 자체 쿠키(_ga)로 사용자 · 페이지뷰 · 유입이 보통처럼 선다.
 * 광고 세 칸(ad_storage · ad_user_data · ad_personalization)은 그대로 denied 다 — 광고 신호는 보내지 않는다.
 * 동의 배너는 여전히 세우지 않는다. 그 대신 사람을 잇지 않는 우리 계측(/beacon)도 함께 보낸다.
 *
 * ↩ 아래는 그때의 글이다 — 왜 denied 였는지가 남아야 다시 같은 자리를 파지 않는다.
 *
 * 동의 배너를 세우지 않기로 했다. 배너는 사용자에게 우리 사정을 묻는 물건이라,
 * 「사용자는 생각하지 않아도 사용할 수 있어야 한다」와 정면으로 부딪친다.
 * 첫 화면의 하늘 위에 승낙을 구하는 상자를 얹는 것도 아름답지 않다.
 *
 * 그래서 Consent Mode v2 의 네 칸을 **모두 denied 로 못 박은 채** 시작한다.
 * 그러면 gtag 는 쿠키를 심지 않고 저장소를 건드리지 않는 핑만 보낸다 —
 * ePrivacy 가 동의를 요구하는 것은 「단말기의 저장소 접근」이므로, 그 접근이
 * 없으면 물을 것도 없다. 광고 신호는 `ads_data_redaction` 으로 한 겹 더 지운다.
 *
 * 대신 **잃는 것이 있다**: 같은 사람의 두 번째 방문을 첫 번째와 잇지 못한다.
 * 「사용자 수」와 「재방문율」은 믿을 수 없는 값이 된다. 남는 것은 페이지뷰·유입
 * 경로·나라·기기인데, 우리가 실제로 보고 싶은 것은 그쪽이다.
 * 나중에 사람 단위를 세야 할 이유가 생기면 그때 배너를 만들고 이 네 칸을 연다 —
 * 순서가 반대가 되면 안 된다.
 *
 * 측정 ID 가 비어 있으면 **아무것도 싣지 않는다.** 로컬 개발과 미리보기가
 * 실제 통계를 더럽히지 않도록, 켜는 것은 빌드할 때 한 번 정하는 일이다.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/*
 * 우리 계측 — 쿠키 없는 핑 하나. GA4 와 **같은 조건**으로 켜진다(측정 ID 가 있을 때만 = 빌드할 때).
 *
 * 위의 denied 네 칸 때문에 GA4 는 이 사이트의 사용자를 세지 않는다 — 2026-10-22 에 Observatory 에서 0 으로 봤다.
 * 배너를 세우지 않기로 한 결정은 지키고, 그 대신 Twinkle API 의 계측 방(/beacon)에 핑 하나를 보낸다.
 * 보내는 것은 집 · 경로 · 리퍼러뿐이고, 서버가 적는 것은 날 · 집 · 경로 · 유입 호스트 · 나라 · 기기 · 그날만 유효한 해시다 —
 * IP 도 UA 도 쿠키도 남지 않는다. sendBeacon 은 text/plain 이라 preflight 가 없고, 화면이 닫히는 중에도 간다.
 * 화면을 갈아 끼울 때는 RouteViews 가 window.__twinkleBeacon 을 한 번 더 부른다.
 */
const BEACON_URL = "https://api.twinklelabs.kr/beacon/v1/hit";

/*
 * 로더를 **이 스크립트 안에서** 단다 — `<script async src>` 를 따로 두면 안 된다.
 *
 * Next 는 head 의 async 스크립트를 위로 끌어올린다. 그래서 JSX 에서 동의 기본값을
 * 먼저 적어도 만들어진 HTML 에서는 로더가 950 자 앞에 선다 — 실제로 그랬다.
 * 순서를 JSX 로 부탁하는 대신, 한 덩이 안에서 **우리가 마지막 줄에 붙인다.**
 */
const boot = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('set','ads_data_redaction',true);
gtag('js',new Date());
gtag('config','${GA_ID}');
(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s)})();
window.__twinkleBeacon=function(){try{navigator.sendBeacon('${BEACON_URL}',JSON.stringify({host:location.hostname,path:location.pathname,referrer:document.referrer}))}catch(e){}};
window.__twinkleBeacon();
`.trim();

export default function Analytics() {
  if (!GA_ID) return null;
  return <script dangerouslySetInnerHTML={{ __html: boot }} />;
}
