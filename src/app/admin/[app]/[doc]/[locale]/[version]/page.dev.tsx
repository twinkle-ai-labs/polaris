import Link from "next/link";
import { notFound } from "next/navigation";
import { readApp, readDoc, readVersion } from "@/lib/content.mjs";
import { localeLabel } from "@/lib/labels";
import { removeVersion, saveVersion } from "@/lib/edit";
import DangerAction from "@/components/admin/DangerAction";
import VersionEditor from "@/components/admin/VersionEditor";
import styles from "../../../../admin.module.css";

export default async function AdminVersion({
  params,
  searchParams,
}: {
  params: Promise<{ app: string; doc: string; locale: string; version: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { app, doc, locale, version } = await params;
  const { saved } = await searchParams;

  const appMeta = readApp(app);
  const docMeta = readDoc(app, doc);
  const found = readVersion(app, doc, locale, Number(version));
  if (!appMeta || !docMeta || !found) notFound();

  return (
    <>
      <nav className={styles.crumb}>
        <Link href="/admin/">앱</Link> · <Link href={`/admin/${app}/`}>{appMeta.name}</Link> ·{" "}
        <Link href={`/admin/${app}/${doc}/`}>{docMeta.name}</Link>
      </nav>

      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>제 {found.version} 판</h1>
          <p className={styles.subtitle}>
            {localeLabel(locale)} · content/apps/{app}/{doc}/{locale}/{found.version}.md
          </p>
        </div>
        <div className={styles.actions}>
          {found.status === "published" ? (
            <Link href={`/${locale}/${app}/${doc}/v/${found.version}/`} className={styles.ghost}>
              공개 화면 보기
            </Link>
          ) : null}
          <DangerAction
            id="version.remove"
            action={removeVersion}
            fields={{ app, doc, locale, version: String(found.version) }}
            label="판본 지우기"
            question={`제 ${found.version} 판을 지울까요?`}
            detail="이 판본의 파일이 사라집니다. 커밋 전이라면 git으로 되돌릴 수 있습니다."
          />
        </div>
      </div>

      <VersionEditor
        app={app}
        doc={doc}
        locale={locale}
        version={found.version}
        value={found}
        action={saveVersion}
        isSaved={saved === "1"}
      />
    </>
  );
}
