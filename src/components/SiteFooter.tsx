import Link from "next/link";
import StarMark from "@/components/StarMark";
import { listApps, type Site } from "@/lib/content.mjs";
import type { Strings } from "@/lib/i18n";
import { HOME_URL, appPath, navLinks } from "@/lib/site";
import s from "./SiteFooter.module.css";

export default function SiteFooter({
  site,
  locale,
  t,
}: {
  site: Site;
  locale: string;
  t: Strings;
}) {
  const links = navLinks(t, locale, site.defaultLocale);
  const apps = listApps(locale);
  const name = site.operator || site.name;
  return (
    <footer className={s.footer}>
      <div className={s.shell}>
        <div className={s.top}>
          <div className={s.brand}>
            <a href={HOME_URL} className={s.name}>
              <span className={s.symbol}>
                <StarMark gradientId="footer-brand" />
              </span>
              {name}
            </a>
            <p>{site.name}</p>
            <span className={s.caption}>{site.tagline || t.homeLead}</span>
          </div>
          <nav className={s.column} aria-label={t.allApps}>
            <h2>{t.navApps}</h2>
            {apps.map((app) => (
              <Link key={app.slug} href={appPath(locale, app.slug)}>
                {app.name}
              </Link>
            ))}
          </nav>
          <nav className={s.column} aria-label={t.footerNav}>
            <h2>{t.footerNav}</h2>
            {links
              .filter((link) => link.key !== "home")
              .map((link) =>
                link.isInternal ? (
                  <Link key={link.key} href={link.href}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.key} href={link.href}>
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ),
              )}
          </nav>
          <div className={s.column}>
            <h2>{t.footerContact}</h2>
            {site.contactEmail && (
              <a className={s.mail} href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
                <span aria-hidden="true">↗</span>
              </a>
            )}
            <p className={s.invitation}>{name}</p>
            <nav className={s.social} aria-label="Social">
              <a
                href="https://www.instagram.com/twinkle.ai.labs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram ↗
              </a>
              <a href="https://x.com/twinkle_ai_labs" target="_blank" rel="noopener noreferrer">
                X (Twitter) ↗
              </a>
            </nav>
          </div>
        </div>
        <div className={s.bottom}>
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <span className={s.signature}>
            <StarMark />
            {site.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
