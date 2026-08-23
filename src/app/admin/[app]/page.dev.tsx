import Link from "next/link";
import { notFound } from "next/navigation";
import { currentVersion, listDocs, listLocales, readApp } from "@/lib/content.mjs";
import { DOC_KINDS, LOCALES, kindLabel, localeLabel } from "@/lib/labels";
import { removeApp, saveApp, saveDoc } from "@/lib/edit";
import Choice from "@/components/admin/Choice";
import DangerAction from "@/components/admin/DangerAction";
import styles from "../admin.module.css";

export default async function AdminApp({ params }: { params: Promise<{ app: string }> }) {
  const { app } = await params;
  const meta = readApp(app);
  if (!meta) notFound();

  const docs = listDocs(app).map((doc) => {
    const locales = listLocales(app, doc.slug);
    return {
      ...doc,
      locales: locales.map((locale) => ({
        locale,
        live: currentVersion(app, doc.slug, locale),
      })),
    };
  });

  return (
    <>
      <nav className={styles.crumb}>
        <Link href="/admin/">앱</Link>
      </nav>

      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{meta.name}</h1>
          <p className={styles.subtitle}>/{meta.defaultLocale}/{meta.slug}/</p>
        </div>
        <Link href={`/${meta.defaultLocale}/${meta.slug}/`} className={styles.ghost}>
          공개 화면 보기
        </Link>
      </div>

      {docs.length === 0 ? (
        <p className={styles.blank}>아직 문서가 없습니다. 아래에서 첫 문서를 만드세요.</p>
      ) : (
        <ul className={styles.list}>
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/admin/${app}/${doc.slug}/`} className={styles.row}>
                <span className={styles.rowMain}>
                  <span className={styles.rowName}>{doc.name}</span>
                  <span className={styles.rowSub}>
                    {kindLabel(doc.kind)} · /{meta.defaultLocale}/{app}/{doc.slug}/
                  </span>
                </span>
                <span className={styles.rowSide}>
                  {doc.locales.length === 0 ? (
                    <span className={styles.chip}>비어 있음</span>
                  ) : (
                    doc.locales.map(({ locale, live }) => (
                      <span
                        key={locale}
                        className={`${styles.chip} ${live ? styles.chipLive : styles.chipDraft}`}
                      >
                        {localeLabel(locale)}
                        {live ? ` 제${live.version}판` : " 초안"}
                      </span>
                    ))
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.card}>
        <p className={styles.sectionTitle}>새 문서</p>
        <form action={saveDoc} className={styles.form}>
          <input type="hidden" name="app" value={app} />
          <div className={styles.fieldsTwo}>
            <label className={styles.field}>
              <span className={styles.label}>이름</span>
              <input className={styles.input} name="name" placeholder="이용약관" required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>주소 이름</span>
              <input
                className={`${styles.input} ${styles.mono}`}
                name="slug"
                placeholder="terms"
                pattern="[a-z0-9-]+"
                required
              />
            </label>
          </div>
          <div className={styles.fieldsTwo}>
            <div className={styles.field}>
              <span className={styles.label}>종류</span>
              <Choice
                name="kind"
                defaultValue="terms"
                options={DOC_KINDS.map((k) => ({ value: k.value, label: k.label }))}
              />
            </div>
            <label className={styles.field}>
              <span className={styles.label}>차례</span>
              <input className={styles.input} name="order" type="number" defaultValue={1} min={1} />
              <span className={styles.hint}>작은 수가 앞에 놓입니다.</span>
            </label>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.save}>
              문서 만들기
            </button>
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <p className={styles.sectionTitle}>앱 설정</p>
        <form action={saveApp} className={styles.form}>
          <input type="hidden" name="before" value={meta.slug} />
          <div className={styles.fieldsTwo}>
            <label className={styles.field}>
              <span className={styles.label}>이름</span>
              <input className={styles.input} name="name" defaultValue={meta.name} required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>주소 이름</span>
              <input
                className={`${styles.input} ${styles.mono}`}
                name="slug"
                defaultValue={meta.slug}
                pattern="[a-z0-9-]+"
                required
              />
              <span className={styles.hint}>바꾸면 공개 주소가 함께 바뀝니다.</span>
            </label>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>한 줄 설명</span>
            <input className={styles.input} name="description" defaultValue={meta.description} />
          </label>
          <div className={styles.fieldsTwo}>
            <div className={styles.field}>
              <span className={styles.label}>기본 언어</span>
              <Choice
                name="defaultLocale"
                defaultValue={meta.defaultLocale}
                options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
              />
            </div>
            <label className={styles.field}>
              <span className={styles.label}>앱 홈페이지</span>
              <input className={styles.input} name="homepage" defaultValue={meta.homepage} />
            </label>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.save}>
              저장
            </button>
            <DangerAction
              action={removeApp}
              fields={{ slug: meta.slug }}
              label="앱 지우기"
              question={`${meta.name}을(를) 지울까요?`}
              detail="이 앱의 모든 문서와 판본이 파일에서 사라집니다. 커밋 전이라면 git으로 되돌릴 수 있습니다."
            />
          </div>
        </form>
      </div>
    </>
  );
}
