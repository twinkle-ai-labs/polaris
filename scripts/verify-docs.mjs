/**
 * 문서 검증 — 두 축.
 *
 *   npm run verify
 *
 * ## 축 1 — 옮긴 것이 «같은 약속»인가
 *
 * 화면 문구의 오역은 어색할 뿐이지만 약관의 오역은 다르다. 한 조항을 빠뜨리면 그 언어의
 * 사용자에게는 **그 약속을 안 한 것**이 되고, 한 문장을 세게 옮기면 지지 않아도 될 책임을
 * 지게 된다. 그래서 뜻보다 **뼈대**를 먼저 본다 — 제목 수·목록 수·번호·링크가 어긋나면
 * 그건 «표현이 다른 것»이 아니라 조항이 사라졌거나 생긴 것이다.
 *
 * ## 축 2 — 그 관할이 요구하는 항목이 문서에 있는가
 *
 * **«그 나라에서 유효한 약관인가»는 판정하지 않는다. 판정할 수 없다.**
 * 유효성은 그 관할의 변호사가 문서 전체를 읽고 답하는 것이지, 낱말을 세는 기계가 흉내 낼
 * 수 있는 종류가 아니다. 여기서 초록이 뜬다고 «법적으로 문제없다»는 뜻이 되는 순간
 * 이 스크립트는 있는 것보다 **없는 것이 낫다** — 없는 안전을 있다고 믿게 하므로.
 *
 * 대신 하는 일은 **대장 지키기**다. 관할마다 요구 항목을 사람이 적어 두면, 기계는 그것이
 * 문서에서 사라지지 않았는지, 새 언어가 대장 없이 들어오지 않았는지를 매번 확인한다.
 * 즉 «검토했다»가 아니라 **«검토한 결과를 잊지 않는다»**를 위한 장치다.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONTENT = "content";
const APPS = join(CONTENT, "apps");

// ── 대장 ────────────────────────────────────────────────────────────
//
// 사람이 손으로 유지한다. 법이 바뀌거나 언어가 늘면 여기부터 고친다.
// `missing` 에 적힌 것은 **아직 안 한 일**이고, 그 값이 왜 아직인지다.

const REQUIRED_EVERYWHERE = {
  "수집하는 항목": ["광고 ID", "Werbe-ID", "Identificador de publicidad", "Identifiant publicitaire",
    "ID pubblicità", "ID de publicidade", "広告 ID", "广告 ID", "廣告 ID", "ID iklan", "Advertising ID", "advertising ID"],
  "제3자 처리자": ["AdMob"],
  "연락처": ["twinkle.ai.labs@gmail.com"],
};

/** 다섯 축은 GDPR·PIPA·APPI·LGPD·PIPL 이 공통으로 요구한다. 지금 우리 방침에는 하나도 없다 */
const NOT_YET = {
  "처리의 법적 근거": "광고 처리의 근거를 «동의»로 둘지 «정당한 이익»으로 둘지 정한 적이 없다",
  "보유 기간": "«앱을 지우면 사라진다»는 적었지만 기간으로 적지 않았다. 광고 쪽 보유는 Google 이 정한다",
  "국외 이전": "AdMob 이 데이터를 어디로 보내는지 확인해 적은 적이 없다",
  "정보주체의 권리": "열람·정정·삭제·이의를 어떻게 받을지 절차를 정한 적이 없다. 받을 데이터가 없다는 것과 권리를 안 적는 것은 다른 문제다",
  "감독기관에 대한 불복": "관할마다 기관이 다르다. 관할별로 적어야 한다",
};

/**
 * **연령 기준은 우리 제품의 진술이지 각 나라 법의 인용이 아니다.**
 *
 * 문서에 적힌 문장은 «이 앱은 만 N세 미만을 대상으로 만들어지지 않았다»이다.
 * 그건 «그 나라의 디지털 동의 연령이 몇 살인가»가 아니라 **우리가 누구를 대상으로
 * 만들었나**를 말하는 자리라, 나라마다 다를 이유가 없다.
 *
 * 한때 관할마다 다른 숫자를 적어 뒀었다. 그런데 그 숫자들은 성격이 서로 달랐다 —
 * 어떤 것은 GDPR 8조의 디지털 동의 연령, 어떤 것은 그 나라 개인정보법의 «아동» 정의,
 * 어떤 것은 미국 COPPA. **다른 것들을 나란히 놓고 «기준»이라 부르고 있었다.**
 *
 * 그래서 하나로 모으고, 아는 것 중 **가장 엄한 쪽**(독일 16)에 맞췄다.
 * 이러면 어느 관할에서도 «우리가 더 넓게 잡았다»가 되지 낮게 잡은 것이 되지 않는다.
 */
const POLICY_AGE = 16;

/**
 * 관할별 참고값 — **보고에만 쓴다.** 우리 숫자가 이보다 낮아지면 경고한다.
 *
 * `sure: false` 는 «확신 없음»이다. 아는 척 적어 두는 것보다 모른다고 적는 편이 낫다 —
 * 다음 사람이 이 표를 근거로 삼을 수 있기 때문이다.
 */
const JURISDICTIONS = {
  ko: { name: "대한민국", law: "개인정보 보호법", localAge: 14, sure: true, what: "법정대리인 동의가 필요한 나이" },
  en: { name: "영어권(기본)", law: "COPPA(미국)", localAge: 13, sure: true, what: "COPPA 의 아동 기준" },
  de: { name: "독일", law: "GDPR 8조 + BDSG", localAge: 16, sure: true, what: "디지털 동의 연령" },
  fr: { name: "프랑스", law: "GDPR 8조", localAge: 15, sure: true, what: "디지털 동의 연령" },
  es: { name: "스페인", law: "GDPR 8조 + LOPDGDD", localAge: 14, sure: true, what: "디지털 동의 연령" },
  it: { name: "이탈리아", law: "GDPR 8조", localAge: 14, sure: true, what: "디지털 동의 연령" },
  "zh-CN": { name: "중국", law: "PIPL", localAge: 14, sure: true, what: "이 아래는 민감정보로 본다" },
  "pt-BR": { name: "브라질", law: "LGPD", localAge: 12, sure: false, what: "«criança» 정의로 알고 있으나 확인 못 함" },
  ja: { name: "일본", law: "個人情報保護法", localAge: 15, sure: false, what: "법에 숫자가 없다. 가이드라인 관행" },
  "zh-TW": { name: "대만", law: "個人資料保護法", localAge: null, sure: false, what: "이 법에 연령 조항을 찾지 못했다" },
  id: { name: "인도네시아", law: "UU PDP", localAge: null, sure: false, what: "확인 못 함" },
};

// ── 읽기 ────────────────────────────────────────────────────────────

function parse(path) {
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${path}: 머리말이 없다`);
  const front = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (kv) front[kv[1]] = kv[2];
  }
  return { front, body: m[2] };
}

/** 뼈대 — 이 넷이 어긋나면 다른 문서가 된 것이다 */
function skeleton(body) {
  const lines = body.split("\n");
  const headings = lines.filter((l) => /^##\s/.test(l)).length;
  const groups = [];
  let run = 0;
  const ordered = [];
  for (const l of lines) {
    const bullet = /^[-*]\s/.test(l);
    const num = l.match(/^(\d{1,2})\.\s/);
    if (bullet || num) {
      run++;
      if (num) ordered.push(num[1]);
    } else if (l.trim() === "" || /^##\s/.test(l)) {
      if (run) groups.push(run);
      run = 0;
    }
  }
  if (run) groups.push(run);
  const links = [...body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[2]);
  return { headings, groups, ordered, links };
}

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ── 검사 ────────────────────────────────────────────────────────────

const problems = [];
const seenLocales = new Set();
const notes = [];
const fail = (m) => problems.push(m);

for (const app of readdirSync(APPS)) {
  const appDir = join(APPS, app);
  for (const kind of readdirSync(appDir).filter((d) => existsSync(join(appDir, d, "doc.json")))) {
    const kindDir = join(appDir, kind);
    const locales = readdirSync(kindDir).filter((d) => existsSync(join(kindDir, d, "1.md")));
    const canon = parse(join(kindDir, "ko", "1.md"));
    const canonSkel = skeleton(canon.body);

    for (const locale of locales) {
      seenLocales.add(locale);
      const where = `${app}/${kind}/${locale}`;
      const { front, body } = parse(join(kindDir, locale, "1.md"));

      // ── 축 1 · 그릇과 판 ──
      if (!front.title) fail(`${where}: title 이 없다`);
      if (!front.summary) fail(`${where}: summary 가 없다`);
      if (front.effectiveAt !== canon.front.effectiveAt)
        fail(`${where}: 시행일이 정본과 다르다 (${front.effectiveAt} ≠ ${canon.front.effectiveAt})`);
      if (front.status !== "published") notes.push(`${where}: status=${front.status}`);

      // ── 축 1 · 뼈대 ──
      const s = skeleton(body);
      if (s.headings !== canonSkel.headings)
        fail(`${where}: 제목 수 ${s.headings} ≠ 정본 ${canonSkel.headings} — 조항이 사라졌거나 생겼다`);
      if (!eq(s.groups, canonSkel.groups))
        fail(`${where}: 목록 묶음 [${s.groups}] ≠ 정본 [${canonSkel.groups}]`);
      if (!eq(s.ordered, canonSkel.ordered))
        fail(`${where}: 번호 [${s.ordered}] ≠ 정본 [${canonSkel.ordered}]`);
      if (!eq(s.links, canonSkel.links))
        fail(`${where}: 링크 [${s.links}] ≠ 정본 [${canonSkel.links}]`);

      // ── 축 1 · 이름과 연락처 ──
      if (/(?<!AI )\bTwinkle Labs\b/.test(body)) fail(`${where}: «Twinkle Labs» — 이름은 «Twinkle AI Labs» 한 벌이다`);
      for (const bad of ["회사", "corporation", "Corporation", "Inc.", "GmbH"])
        if (body.includes(bad)) fail(`${where}: «${bad}» 가 있다 — 법인이 아니다`);
      const mails = new Set([...body.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)*/g)].map((m) => m[0]));
      for (const m of mails)
        if (m !== "twinkle.ai.labs@gmail.com") fail(`${where}: 대표 메일이 아닌 주소 «${m}»`);

      // ── 축 1 · 옮기다 만 자리 ──
      if (locale !== "ko" && /[가-힣]/.test(body)) fail(`${where}: 한글이 남아 있다`);
      if (["ja", "zh-CN", "zh-TW"].includes(locale)) {
        /*
         * 옮기지 **않는 것**들. 셋으로 갈린다:
         *   · 이름 — Twinkle AI Labs · Pocket PDF · Google Play. 이름은 한 벌이라 번역하지 않는다
         *   · 규격·기술 — PDF · OCR · Android · IP · ID · OS. 그 나라에서도 그대로 부른다
         *   · 주소 조각 — 메일과 링크에 든 낱말들
         * 여기 없는 라틴 낱말이 CJK 문서에 있으면 그것은 «옮기다 만 자리»다.
         */
        const allow = new Set(["Twinkle", "AI", "Labs", "Google", "AdMob", "Play", "IP", "ID", "OS",
          "PDF", "OCR", "Android", "Pocket", "pocket", "pdf",
          "twinkle", "ai", "labs", "gmail", "com", "policies", "google", "privacy", "https", "stock", "calculator"]);
        const stray = [...new Set([...body.matchAll(/[A-Za-z]{2,}/g)].map((m) => m[0]))].filter((w) => !allow.has(w));
        if (stray.length) fail(`${where}: 옮기지 않은 낱말 ${stray.join(", ")}`);
      }

      // ── 축 1 · 문단 수 ──
      // 뼈대가 같아도 한 문단을 통째로 빠뜨리면 안 걸린다. 문단 수까지 세야 «덜 옮긴 것»이 보인다
      const paras = (t) => t.split(/\n\s*\n/).filter((b) => b.trim() && !/^##\s/.test(b.trim())).length;
      if (paras(body) !== paras(canon.body))
        fail(`${where}: 문단 수 ${paras(body)} ≠ 정본 ${paras(canon.body)} — 한 덩이를 빠뜨렸거나 더했다`);

      // ── 축 1 · 숫자 ──
      // «30일 전 공지»가 «15일»이 되면 다른 약속이다. 연령은 관할마다 다르므로 축 2 에서 따로 본다
      const nums = (t) => [...t.matchAll(/(?<![\w.])(\d{2,})(?![\w.])/g)].map((m) => m[1]).sort();
      if (!eq(nums(body), nums(canon.body)))
        notes.push(`${where}: 숫자가 정본과 다르다 [${nums(body)}] ≠ [${nums(canon.body)}]`);

      // ── 축 1 · 링크 라벨 ──
      // 주소는 같아야 하고(위에서 봄) **라벨은 그 언어여야** 한다. 주소만 옮기고 말은 두고 온 자리를 잡는다
      if (locale !== "ko") {
        const label = (t) => [...t.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[1]);
        const mine = label(body), theirs = label(canon.body);
        mine.forEach((l, i) => {
          if (theirs[i] && l === theirs[i]) fail(`${where}: 링크 라벨 «${l}» 이 정본 그대로다 — 옮기지 않았다`);
        });
      }

      // ── 축 1 · 머리말이 본문과 같은 언어인가 ──
      if (locale !== "ko" && (/[가-힣]/.test(front.title) || /[가-힣]/.test(front.summary)))
        fail(`${where}: 머리말(title·summary)에 한글이 남아 있다`);

      // ── 축 1 · 용어 한 벌 ──
      // 한 문서 안에서 같은 것을 두 낱말로 부르면, 읽는 사람은 그 둘이 다른 것인 줄 안다.
      // 약관에서 «운영자»와 «제공자»가 섞이면 누가 책임을 지는지가 흐려진다.
      const TERM_PAIRS = {
        ko: [["운영자", ["제공자", "사업자", "당사"]], ["이용자", ["사용자", "고객"]]],
        en: [["Operator", ["Provider", "Company", "we ", "us "]], ["Service", ["Application", "Product"]]],
        de: [["Betreiber", ["Anbieter", "Unternehmen"]]],
        fr: [["Opérateur", ["Fournisseur", "Société"]]],
        it: [["Gestore", ["Fornitore", "Società"]]],
        es: [["Operador", ["Proveedor", "Empresa"]]],
        "pt-BR": [["Operador", ["Fornecedor", "Empresa"]]],
        ja: [["運営者", ["提供者", "事業者"]]],
        "zh-CN": [["运营者", ["提供者", "本公司"]]],
        "zh-TW": [["運營者", ["提供者", "本公司"]]],
        id: [["Pengelola", ["Penyedia", "Perusahaan"]]],
      };
      for (const [chosen, rivals] of TERM_PAIRS[locale] ?? []) {
        if (!body.includes(chosen)) continue;
        for (const rival of rivals)
          if (body.includes(rival))
            fail(`${where}: «${chosen}» 와 «${rival}» 가 섞여 있다 — 같은 것은 한 낱말로`);
      }

      /*
       * ── 축 1 · 상대를 **격식으로** 부르는가 ──
       *
       * 약관은 두 사람 사이의 약속이고, 그 사람을 뭐라 부르는지가 관계를 정한다.
       * 독일어 약관이 «du» 로 말하면 뜻은 그대로인데 **문서의 격이 달라진다** —
       * 계약서가 아니라 쪽지가 된다. 번역기는 이걸 자주 놓치고, 뜻이 맞으니
       * 검수에서도 안 걸린다.
       *
       * 낱말 경계를 양쪽 다 잡아야 한다 — 처음엔 앞만 잡아서 독일어의
       * «**Dein**stallieren»(앱 삭제)을 «너의»로 읽고 멀쩡한 문서를 잡았다.
       */
      const INFORMAL = {
        de: ["du", "dein", "deine", "deinem", "deiner", "dich", "dir"],
        fr: ["tu", "ton", "ta", "tes", "toi"],
        es: ["tú", "tus", "ti", "contigo"],
        "pt-BR": ["tu", "teu", "tua", "ti"],
        it: ["tu", "tuo", "tua", "tuoi"],
        id: ["kamu", "kau"],
        ja: ["だ。", "である。"],
      };
      for (const word of INFORMAL[locale] ?? []) {
        // 한자·가나에는 낱말 경계가 없다 — 그쪽은 문장 끝 표시라 그대로 찾는다
        const found = /^[a-zà-ÿ]+$/i.test(word)
          ? new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, "iu").test(body)
          : body.includes(word);
        if (found)
          fail(`${where}: 허물없는 말 «${word}» — 약관이 상대를 부르는 격이 흔들린다`);
      }

      /*
       * ── 축 1 · 인용부호가 **그 나라의 것**인가 ──
       *
       * 낱말을 다 옮겨 놓고도 번역이 «번역처럼» 읽히는 이유의 절반은 문장부호다.
       * 우리 집 습관인 «…» 를 그대로 두면 브라질 사람에게 그 문서는 «포르투갈어로 적힌
       * 한국 문서»로 보인다 — 실제로 pt-BR·id 가 우리 겹화살괄호를, zh-CN 이 곧은
       * 따옴표를 이고 있었다. 셋 다 그 나라 조판 관례가 아니다.
       *
       * 뜻이 틀린 것은 아니니 «번역 오류»로는 절대 안 걸린다. 그래서 따로 센다.
       */
      const QUOTES = {
        ko: ["«", "»"], fr: ["«", "»"], es: ["«", "»"], it: ["«", "»"],
        de: ["„", "“"], ja: ["「", "」"], "zh-TW": ["「", "」"],
        "zh-CN": ["“", "”"], "pt-BR": ["“", "”"], id: ["“", "”"], en: ['"', '"'],
      };
      /*
       * 여는 글자만 견주면 안 된다 — 독일어의 **닫는** 따옴표가 «“» 인데 그것이 중국어의
       * **여는** 따옴표와 같은 글자다. 처음 이 검사는 멀쩡한 독일어를 여섯 번 잡았다.
       * 내 짝에 든 글자는 그 자리에 있어도 되는 것이므로, 짝 전체를 보고 뺀다.
       */
      const mine = QUOTES[locale];
      if (mine) {
        const ok = new Set(mine);
        const foreign = new Set(Object.values(QUOTES).flat().filter((c) => !ok.has(c)));
        for (const c of foreign)
          if (body.includes(c))
            fail(`${where}: 남의 인용부호 «${c}» 가 섞여 있다 — 이 언어는 ${mine[0]}${mine[1]}`);
      }

      // ── 축 1 · 제목이 그 언어의 조문 문법인가 ──
      // 정본의 «제1조 (목적)» 을 «1. Purpose» 로 옮기는 것은 맞지만, 번호가 아예 없으면
      // 조항을 가리킬 수 없다 — 약관에서 «제5조에 따라»는 장식이 아니라 주소다
      // 아라비아 숫자만 세면 안 된다 — 중국어 조문은 «第一条» 처럼 한자 숫자를 쓰는 것이
      // 그 나라 법률문서의 문법이다. 이 검사는 그것을 **틀렸다고 잡았었다**(검사가 틀렸다)
      const NUMERAL = /[\d一二三四五六七八九十]/;
      const countNumbered = (t) =>
        t.split("\n").filter((l) => /^##\s/.test(l)).filter((l) => NUMERAL.test(l)).length;
      const numbered = countNumbered(body);
      const canonNumbered = countNumbered(canon.body);
      if (numbered !== canonNumbered)
        fail(`${where}: 번호가 붙은 제목 ${numbered} ≠ 정본 ${canonNumbered} — 조항을 가리킬 수 없게 된다`);

      // ── 축 2 · 관할 대장 ──
      if (kind === "privacy") {
        const j = JURISDICTIONS[locale];
        if (!j) {
          fail(`${where}: 관할 대장에 없다 — 무슨 법을 따르는지 정하지 않았다`);
        } else {
          for (const [topic, kws] of Object.entries(REQUIRED_EVERYWHERE))
            if (!kws.some((k) => body.includes(k))) fail(`${where}: «${topic}» 가 문서에서 안 보인다`);
          /*
           * 단위말로 찾지 않는다 — «under 16» 처럼 숫자 뒤에 아무것도 안 붙는 언어가 있다.
           * 방침 본문에 두 자리 수는 연령 하나뿐이므로 그냥 두 자리 수를 센다.
           */
          const ages = [...new Set([...body.matchAll(/(?<![\w.])(\d{2})(?![\w.])/g)].map((m) => m[1]))];
          const age = ages.length === 1 ? [null, ages[0]] : null;
          if (ages.length > 1) fail(`${where}: 두 자리 수가 여럿이다 [${ages}] — 어느 것이 연령인지 알 수 없다`);
          if (!age) {
            fail(`${where}: 연령 문장이 없다`);
          } else if (Number(age[1]) !== POLICY_AGE) {
            // 한 벌이어야 한다 — 언어마다 다른 숫자를 적으면 언어마다 다른 약속이 된다
            fail(`${where}: 연령 ${age[1]} ≠ 우리 기준 ${POLICY_AGE}`);
          } else if (j.sure && j.localAge != null && POLICY_AGE < j.localAge) {
            fail(`${where}: 우리 기준 ${POLICY_AGE} 이 ${j.name}(${j.law}) 의 ${j.localAge} 보다 낮다`);
          }
        }
      }
    }
  }
}

// ── 보고 ────────────────────────────────────────────────────────────

/*
 * ── 축 1 · 날짜가 그 언어의 것으로 나오는가 ──
 *
 * 시행일은 문서 본문에 없다 — 화면이 `Intl.DateTimeFormat(locale)` 로 그린다.
 * 그래서 여기서 셀 것은 글자가 아니라 **로케일 코드가 Intl 이 아는 것인가**다.
 * 모르는 코드를 주면 Intl 은 터지지 않고 **조용히 다른 언어로 그린다** —
 * 인도네시아어 약관 위에 «August 1, 2026» 이 서 있어도 아무도 안 알려 준다.
 * 코드를 하나 늘릴 때 오타 한 글자면 그렇게 된다.
 */
for (const locale of [...seenLocales].sort()) {
  const [supported] = Intl.DateTimeFormat.supportedLocalesOf(locale);
  if (!supported)
    fail(`${locale}: Intl 이 모르는 로케일 코드 — 시행일이 조용히 다른 언어로 그려진다`);
}

console.log("── 축 1 · 같은 약속인가 / 축 2 · 요구 항목이 있는가 ──\n");
if (problems.length) {
  console.log(`✗ ${problems.length}건\n`);
  problems.forEach((p) => console.log(`   ${p}`));
  console.log();
} else {
  console.log("✓ 어긋남 없음\n");
}

console.log(`── 연령 기준 ── 우리 진술: 만 ${POLICY_AGE}세 미만 대상 아님 (아는 것 중 가장 엄한 쪽에 맞춤)`);
for (const [loc, j] of Object.entries(JURISDICTIONS)) {
  const mark = j.sure ? " " : "?";
  const val = j.localAge == null ? "—" : String(j.localAge);
  console.log(`  ${mark} ${loc.padEnd(6)} ${val.padStart(2)}  ${j.name} · ${j.law} — ${j.what}`);
}
console.log("  ? = 확신 없음. 아는 척 적어 두는 것보다 모른다고 적는 편이 낫다\n");

console.log("── 아직 없는 항목 (관할 공통) ──");
for (const [topic, why] of Object.entries(NOT_YET)) console.log(`   ${topic}\n      ${why}`);

if (notes.length) {
  console.log("\n── 사람이 정할 것 ──");
  notes.forEach((n) => console.log(`   ${n}`));
}

console.log("\n※ 이 스크립트가 초록이라고 «법적으로 문제없다»는 뜻이 아니다.");
console.log("  유효성은 그 관할의 변호사가 판정한다. 여기가 세는 것은 «적어 둔 것이 사라지지 않았는가» 뿐이다.");

process.exit(problems.length ? 1 : 0);
