import Link from "next/link";
import { listApps, listDocs, publishedLocales, readSite } from "@/lib/content.mjs";
import { LOCALES, localeLabel } from "@/lib/labels";
import { saveApp, saveSite } from "@/lib/edit";
import Choice from "@/components/admin/Choice";
import styles from "./admin.module.css";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const site = readSite();
  const apps = listApps().map((app) => {
    const docs = listDocs(app.slug);
    const locales = new Set<string>();
    for (const doc of docs) for (const l of publishedLocales(app.slug, doc.slug)) locales.add(l);
    return { ...app, docs, locales: [...locales] };
  });

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>앱</h1>
          <p className={styles.subtitle}>약관을 기를 앱을 고르거나, 새로 등록하세요.</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <p className={styles.blank}>아직 앱이 없습니다. 아래에서 첫 앱을 등록하세요.</p>
      ) : (
        <ul className={styles.list}>
          {apps.map((app) => (
            <li key={app.slug}>
              <Link href={`/admin/${app.slug}/`} className={styles.row}>
                <span className={styles.rowMain}>
                  <span className={styles.rowName}>{app.name}</span>
                  <span className={styles.rowSub}>/{app.defaultLocale}/{app.slug}/</span>
                </span>
                <span className={styles.rowSide}>
                  <span className={styles.chip}>문서 {app.docs.length}</span>
                  {app.locales.map((l) => (
                    <span key={l} className={styles.chip}>
                      {localeLabel(l)}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.card}>
        <p className={styles.sectionTitle}>새 앱</p>
        <form action={saveApp} className={styles.form}>
          <div className={styles.fieldsTwo}>
            <label className={styles.field}>
              <span className={styles.label}>이름</span>
              <input className={styles.input} name="name" placeholder="주식 계산기" required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>주소 이름</span>
              <input
                className={`${styles.input} ${styles.mono}`}
                name="slug"
                placeholder="stock-calculator"
                pattern="[a-z0-9-]+"
                required
              />
              <span className={styles.hint}>/언어/여기/… 에 쓰입니다. 영소문자·숫자·하이픈.</span>
            </label>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>한 줄 설명</span>
            <input className={styles.input} name="description" placeholder="앱이 무엇을 하는지" />
          </label>
          <div className={styles.field}>
            <span className={styles.label}>기본 언어</span>
            <Choice
              id="newApp.defaultLocale"
              name="defaultLocale"
              defaultValue="ko"
              options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
            />
            <span className={styles.hint}>
              요청한 언어의 판본이 없을 때 대신 내보낼 언어입니다.
            </span>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.save}>
              앱 만들기
            </button>
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <p className={styles.sectionTitle}>사이트</p>
        <form action={saveSite} className={styles.form}>
          <div className={styles.fieldsTwo}>
            <label className={styles.field}>
              <span className={styles.label}>이름</span>
              <input className={styles.input} name="name" defaultValue={site.name} required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>도메인</span>
              <input
                className={`${styles.input} ${styles.mono}`}
                name="domain"
                defaultValue={site.domain}
                placeholder="terms.example.com"
              />
              <span className={styles.hint}>
                빌드할 때 CNAME 파일이 되고, API가 돌려줄 절대 주소가 됩니다.
              </span>
            </label>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>한 줄 소개</span>
            <input className={styles.input} name="tagline" defaultValue={site.tagline} />
          </label>
          <div className={styles.fieldsTwo}>
            <label className={styles.field}>
              <span className={styles.label}>문의 메일</span>
              <input className={styles.input} name="contactEmail" defaultValue={site.contactEmail} />
            </label>
            <div className={styles.field}>
              <span className={styles.label}>화면 기본 언어</span>
              <Choice
                id="site.defaultLocale"
                name="defaultLocale"
                defaultValue={site.defaultLocale}
                options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
              />
              <span className={styles.hint}>
                홈과 앱 목록처럼 문서가 없는 화면이 어느 말로 설지 정합니다.
              </span>
            </div>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>시간대</span>
            <input
              className={`${styles.input} ${styles.mono}`}
              name="timezone"
              defaultValue={site.timezone}
              placeholder="Asia/Seoul"
            />
            <span className={styles.hint}>
              시행일을 어느 시간대의 «오늘»로 셀지 정합니다. 매일 이 시간대의 0시 5분에
              배포가 스스로 한 번 돕니다.
            </span>
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.save}>
              저장
            </button>
            {saved ? <span className={styles.saved}>저장했습니다</span> : null}
          </div>
        </form>
      </div>
    </>
  );
}
