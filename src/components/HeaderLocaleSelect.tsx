"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./HeaderLocaleSelect.module.css";

const FLAGS: Record<string, string> = {
  ko: "/flags/kr.png", en: "/flags/us.png", ja: "/flags/jp.png",
  "zh-CN": "/flags/cn.png", "zh-TW": "/flags/tw.png", es: "/flags/es.png",
  de: "/flags/de.png", fr: "/flags/fr.png", it: "/flags/it.png",
  "pt-BR": "/flags/br.png", id: "/flags/id.png",
};

export default function HeaderLocaleSelect({ locales, current, defaultLocale, label }: {
  locales: readonly { value: string; label: string }[];
  current: string;
  defaultLocale: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const selected = locales.find((locale) => locale.value === current) ?? locales[0];

  useEffect(() => {
    if (!open) return;
    const closeAway = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeAway);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeAway);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  function move(locale: string) {
    setOpen(false);
    if (locale === current) return;
    document.cookie = `polaris-locale=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`;
    const parts = pathname.split("/").filter(Boolean);
    const supported = new Set(locales.map((item) => item.value));

    if (parts.length >= 2 && supported.has(parts[0])) {
      router.push(`/${locale}/${parts.slice(1).join("/")}/`);
      return;
    }
    router.push(locale === defaultLocale ? "/" : `/${locale}/`);
  }

  return (
    <div className={styles.wrap} ref={wrap}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((value) => !value)} aria-label={label} aria-haspopup="listbox" aria-expanded={open}>
        <Image className={styles.flag} src={FLAGS[selected.value]} alt="" width={20} height={14} />
        <span className={styles.current}>{selected.label}</span>
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="m3 4.75 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className={styles.menu}>
          <div className={styles.menuScroll} role="listbox" aria-label={label}>
            {locales.map((locale) => (
              <button key={locale.value} type="button" role="option" aria-selected={locale.value === current} className={`${styles.option} ${locale.value === current ? styles.optionActive : ""}`} onClick={() => move(locale.value)}>
                <Image className={styles.flag} src={FLAGS[locale.value]} alt="" width={20} height={14} />
                <span>{locale.label}</span>
                {locale.value === current ? <span className={styles.check} aria-hidden="true">✓</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
