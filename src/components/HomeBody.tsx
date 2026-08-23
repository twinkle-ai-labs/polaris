import Image from "next/image";
import Link from "next/link";
import { listApps, listDocs, readSite } from "@/lib/content.mjs";
import StarMark from "@/components/StarMark";
import Starfield from "@/components/Starfield";
import { strings } from "@/lib/i18n";
import styles from "@/app/home.module.css";

/** 홈의 몸통 — `/` 와 `/<언어>/` 가 같은 것을 다른 언어로 그린다. */
export default function HomeBody({ locale }: { locale: string }) {
  const site = readSite(locale);
  const t = strings(locale);
  const apps = listApps(locale).map((app) => {
    const docs = listDocs(app.slug);
    return { ...app, docs };
  });

  return (
    <>
      <div className={styles.hero}>
        {/* 하늘은 첫 화면의 것이다 — 이름이 서는 가운데 기둥만 비워 둔다. */}
        <Starfield
          height="100%"
          dots={92}
          sparkles={10}
          shooting={2}
          keepout={{ x: [22, 78], y: [4, 58] }}
        />
        <div className={styles.intro}>
          <span className={styles.heroMark}>
            <StarMark gradientId="polaris-hero" />
          </span>
          <p className={styles.eyebrow}>{site.name}</p>
          <h1 className={styles.title}>{t.heroTitle}</h1>
          <p className={styles.define}>{t.heroDefine}</p>
          <p className={styles.lead}>{site.tagline || t.homeLead}</p>
          <div className={styles.actions}>
            <a className={styles.cta} href="#apps">{t.allApps}</a>
          </div>
        </div>
      </div>

      <section id="apps" className={styles.appsSection}>
        <header className={styles.sectionHead}>
          <p className={styles.sectionKicker}>{t.archive}</p>
          <h2 className={styles.sectionTitle}>{t.allApps}</h2>
        </header>
        {apps.length === 0 ? (
          <div className={styles.blank}>
            <p className={styles.blankTitle}>{t.blankTitle}</p>
            <p className={styles.blankBody}>{t.blankBody}</p>
          </div>
        ) : (
          <ul className={styles.grid}>
            {apps.map((app) => (
              <li key={app.slug}>
                <Link href={`/${locale}/${app.slug}/`} className={styles.card}>
                {/* 앱은 제 얼굴로 선다 — 아이콘이 없을 때에만 첫 글자가 대신한다. */}
                {app.icon ? (
                  <Image
                    className={styles.icon}
                    src={app.icon}
                    alt=""
                    width={96}
                    height={96}
                  />
                ) : (
                  <span className={styles.monogram} aria-hidden="true">
                    {app.name.trim().charAt(0)}
                  </span>
                )}
                <span className={styles.arrow} aria-hidden="true">↗</span>
                <span className={styles.cardName}>{app.name}</span>
                {app.description ? <span className={styles.cardDesc}>{app.description}</span> : null}
                <span className={styles.cardMeta}>
                  <span className={styles.count}>{t.docCount(app.docs.length)}</span>
                </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
