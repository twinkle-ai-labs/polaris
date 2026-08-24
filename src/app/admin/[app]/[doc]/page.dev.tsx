import Link from "next/link";
import { notFound } from "next/navigation";
import { currentVersion, listLocales, listVersions, readApp, readDoc } from "@/lib/content.mjs";
import { DOC_KINDS, LOCALES, formatDate, kindLabel, localeLabel } from "@/lib/labels";
import { newVersion, removeDoc, saveDoc } from "@/lib/edit";
import Choice from "@/components/admin/Choice";
import DangerAction from "@/components/admin/DangerAction";
import styles from "../../admin.module.css";
import own from "./doc.module.css";

export default async function AdminDoc({
  params,
}: {
  params: Promise<{ app: string; doc: string }>;
}) {
  const { app, doc } = await params;
  const appMeta = readApp(app);
  const docMeta = readDoc(app, doc);
  if (!appMeta || !docMeta) notFound();

  const locales = listLocales(app, doc);
  const today = new Date().toISOString().slice(0, 10);
  const unused = LOCALES.filter((l) => !locales.includes(l.value));

  return (
    <>
      <nav className={styles.crumb}>
        <Link href="/admin/">앱</Link> · <Link href={`/admin/${app}/`}>{appMeta.name}</Link>
      </nav>

      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{docMeta.name}</h1>
          <p className={styles.subtitle}>
            {kindLabel(docMeta.kind)} · /{appMeta.defaultLocale}/{app}/{doc}/
          </p>
        </div>
        <Link href={`/${appMeta.defaultLocale}/${app}/${doc}/`} className={styles.ghost}>
          공개 화면 보기
        </Link>
      </div>

      {locales.length === 0 ? (
        <p className={styles.blank}>아직 아무 언어도 없습니다. 아래에서 첫 판본을 낳으세요.</p>
      ) : (
        locales.map((locale) => {
          const versions = listVersions(app, doc, locale);
          const live = currentVersion(app, doc, locale);
          return (
            <section key={locale} className={own.group}>
              <div className={own.groupHead}>
                <h2 className={own.groupTitle}>{localeLabel(locale)}</h2>
                <form action={newVersion}>
                  <input type="hidden" name="app" value={app} />
                  <input type="hidden" name="doc" value={doc} />
                  <input type="hidden" name="locale" value={locale} />
                  <button type="submit" className={styles.ghost}>
                    새 판본
                  </button>
                </form>
              </div>
              <ul className={styles.list}>
                {versions.map((v) => {
                  const state =
                    v.status === "draft"
                      ? { label: "초안", cls: styles.chipDraft }
                      : v.version === live?.version
                        ? { label: "현행", cls: styles.chipLive }
                        : v.effectiveAt > today
                          ? { label: "예정", cls: styles.chipSoon }
                          : { label: "지난 판", cls: styles.chip };
                  return (
                    <li key={v.version}>
                      <Link
                        href={`/admin/${app}/${doc}/${locale}/${v.version}/`}
                        className={styles.row}
                      >
                        <span className={styles.rowMain}>
                          <span className={styles.rowName}>
                            제 {v.version} 판 — {v.title}
                          </span>
                          <span className={styles.rowSub}>
                            {v.effectiveAt ? `${formatDate(v.effectiveAt)} 시행` : "시행일 없음"}
                          </span>
                        </span>
                        <span className={styles.rowSide}>
                          <span className={`${styles.chip} ${state.cls}`}>{state.label}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      {unused.length > 0 ? (
        <div className={styles.card}>
          <p className={styles.sectionTitle}>언어 늘리기</p>
          <form action={newVersion} className={styles.form}>
            <input type="hidden" name="app" value={app} />
            <input type="hidden" name="doc" value={doc} />
            <div className={styles.fieldsTwo}>
              <div className={styles.field}>
                <span className={styles.label}>새 언어</span>
                <Choice
                  id="newLocale.locale"
                  name="locale"
                  defaultValue={unused[0].value}
                  options={unused.map((l) => ({ value: l.value, label: l.label }))}
                />
                <span className={styles.hint}>
                  빈 제1판을 낳습니다. 다른 언어의 글을 옮겨 담아 채우세요.
                </span>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>제목</span>
                <input className={styles.input} name="title" defaultValue={docMeta.name} />
              </label>
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.save}>
                판본 만들기
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className={styles.card}>
        <p className={styles.sectionTitle}>문서 설정</p>
        <form action={saveDoc} className={styles.form}>
          <input type="hidden" name="app" value={app} />
          <input type="hidden" name="before" value={docMeta.slug} />
          <div className={styles.fieldsTwo}>
            <label className={styles.field}>
              <span className={styles.label}>이름</span>
              <input className={styles.input} name="name" defaultValue={docMeta.name} required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>주소 이름</span>
              <input
                className={`${styles.input} ${styles.mono}`}
                name="slug"
                defaultValue={docMeta.slug}
                pattern="[a-z0-9-]+"
                required
              />
            </label>
          </div>
          <div className={styles.fieldsTwo}>
            <div className={styles.field}>
              <span className={styles.label}>종류</span>
              <Choice
                id="doc.kind"
                name="kind"
                defaultValue={docMeta.kind}
                options={DOC_KINDS.map((k) => ({ value: k.value, label: k.label }))}
              />
            </div>
            <label className={styles.field}>
              <span className={styles.label}>차례</span>
              <input
                className={styles.input}
                name="order"
                type="number"
                defaultValue={docMeta.order}
                min={1}
              />
            </label>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.save}>
              저장
            </button>
            <DangerAction
              id="doc.remove"
              action={removeDoc}
              fields={{ app, slug: docMeta.slug }}
              label="문서 지우기"
              question={`${docMeta.name}을(를) 지울까요?`}
              detail="모든 언어의 모든 판본이 파일에서 사라집니다."
            />
          </div>
        </form>
      </div>
    </>
  );
}
