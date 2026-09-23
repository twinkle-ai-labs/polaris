/**
 * 공지 기간 — **오늘 내보내면 며칠 전 공지인가.**
 *
 *   npm run notice        내보내기 직전에 — 약속보다 짧으면 빨갛다
 *   npm run verify        빌드마다 — 세어서 적기만 한다 (`--note`)
 *
 * ## 무엇을 막는가
 *
 * 약관 2조는 «변경된 약관은 시행일과 함께 사전에 공지»(통상 한 주)와 «이용자에게 불리한
 * 변경은 30일 전»을 약속한다. 그 시계는 **공개 페이지에 뜬 날**부터 돌기 시작한다 —
 * 그런데 시행일은 글을 쓰는 날 정해지고, 내보내는 날은 며칠 뒤가 된다. 그 사이만큼
 * 공지가 **조용히 짧아진다.**
 *
 * 실제로 그랬다 (Polaris 2026-09-16 → 09-17): 09-16 에 «한 주 뒤(09-23)»로 적은 Pocket PDF
 * 제2판을 09-17 에 내보내면서 공지가 엿새가 됐다. 사람이 알아채고 하루 미뤘지만,
 * 알아챈 것도 사람이고 고친 것도 사람이었다 — 어떤 검사도 빨개지지 않았다.
 * `verify-docs` 는 «언어끼리 시행일이 같은가»만 본다.
 *
 * ## 왜 빌드를 막지 않는가
 *
 * 이 수는 **날마다 줄어든다.** 30일 공지를 제대로 시작한 판도 이튿날에는 29일이 된다 —
 * 그러니 «남은 날 ≥ 약속»을 빌드에 걸면, 공지가 정상으로 돌고 있는 동안 매일 도는
 * 정기 빌드가 빨개진다. 그 빌드는 시행일이 오면 새 판을 현행으로 세우는 바로 그 빌드라
 * (deploy.yml 의 cron), 막으면 **판이 제 날에 서지 못한다.** 고치려던 것보다 큰 것이 깨진다.
 *
 * 그래서 두 얼굴이다 — 빌드에서는 세어서 적고(`--note`), **내보내기 직전 한 번** 빨개진다.
 * 그 한 번이 공지의 시계가 실제로 도는 순간이고, 거기가 이 검사가 설 자리다.
 * 부르는 자리는 Releaser 의 수첩에 적혀 있다.
 */
import {
  DEFAULT_NOTICE_DAYS,
  listApps,
  listDocs,
  listLocales,
  today,
  upcomingVersion,
} from "../src/lib/content.mjs";

const isNote = process.argv.includes("--note");
const now = today();

/** 날짜 두 개 사이의 날수. 글자로 받은 `YYYY-MM-DD` 라 시간대가 끼어들 자리가 없다 */
function daysBetween(from, to) {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/*
 * 한 판은 언어 수만큼 파일이지만 **약속은 하나**다 — 시행일도 공지 기간도 언어끼리 같아야
 * 하고, 그건 `verify-docs` 가 센다. 그래서 여기서는 앱·문서마다 한 줄로 모은다.
 * 열한 언어짜리 판이 열한 줄로 뜨면 읽는 사람이 그중 무엇이 다른지 찾게 된다.
 */
const rows = [];
for (const app of listApps()) {
  for (const doc of listDocs(app.slug)) {
    for (const locale of listLocales(app.slug, doc.slug)) {
      const next = upcomingVersion(app.slug, doc.slug, locale, now);
      if (!next) continue;
      const promised = next.notice ?? DEFAULT_NOTICE_DAYS;
      const row = rows.find(
        (r) => r.app === app.slug && r.doc === doc.slug && r.version === next.version,
      );
      if (row) {
        row.locales.push(locale);
        continue;
      }
      rows.push({
        app: app.slug,
        doc: doc.slug,
        version: next.version,
        effectiveAt: next.effectiveAt,
        promised,
        isPromiseWritten: next.notice != null,
        days: daysBetween(now, next.effectiveAt),
        locales: [locale],
      });
    }
  }
}

console.log(`── 공지 기간 ── 오늘(${now}) 내보낸다고 치고 센다\n`);

if (!rows.length) {
  console.log("   내보낼 다음 판이 없다.\n");
  process.exit(0);
}

const short = [];
for (const row of rows) {
  const where = `${row.app}/${row.doc} 제${row.version}판 (${row.locales.length}개 언어)`;
  const promise = row.isPromiseWritten ? `${row.promised}일` : `${row.promised}일(안 적혀 있다)`;
  const mark = row.days < row.promised ? "✗" : "✓";
  console.log(`   ${mark} ${where} — 시행 ${row.effectiveAt}, 오늘 내보내면 ${row.days}일 · 약속 ${promise}`);
  if (row.days < row.promised) short.push(row);
}
console.log();

if (short.length) {
  console.log(
    isNote
      ? "→ 약속보다 짧다. 지금 내보낼 판이라면 시행일을 미룬다 (`npm run notice` 가 내보내기 전에 이것을 막는다).\n"
      : "→ 약속보다 짧다. **시행일을 미루거나**, 약속이 달라졌으면 머리말의 `notice` 를 고친다.\n" +
          "   이미 공지가 시작된 판이면 이 검사를 돌릴 자리가 아니다 — 시계는 공개된 날부터 돈다.\n",
  );
}

console.log("※ 세는 것은 «오늘 내보내면 며칠인가» 하나다. 이미 공개된 판이 며칠째인지는 여기서 알 수 없다 —");
console.log("  그건 공개 페이지가 뜬 날이 정하고, 그 날은 이 저장소에 적혀 있지 않다.");

process.exit(!isNote && short.length ? 1 : 0);
