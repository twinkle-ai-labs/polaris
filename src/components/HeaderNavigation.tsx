"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CURRENT_NAV_KEY, type NavLink } from "@/lib/site";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  navigationMenuClosed,
  navigationMenuToggled,
  selectIsNavigationMenuOpen,
} from "@/store/navigationMenuSlice";
import styles from "@/app/layout.module.css";

/** 같은 링크를 넓은 화면에서는 가로로, 좁은 화면에서는 펼친 목록으로 보여 준다. */
export default function HeaderNavigation({
  links,
  label,
  openLabel,
  closeLabel,
  children,
}: {
  links: NavLink[];
  label: string;
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsNavigationMenuOpen);
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dispatch(navigationMenuClosed());
  }, [dispatch, pathname]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 55.99em)");
    const closeOnResize = () => {
      const focus = document.activeElement;
      dispatch(navigationMenuClosed());
      if (mobile.matches && navRef.current?.contains(focus)) {
        toggleRef.current?.focus();
      } else if (!mobile.matches && focus === toggleRef.current) {
        navRef.current?.querySelector<HTMLElement>("[aria-current='page']")?.focus();
      }
    };
    mobile.addEventListener("change", closeOnResize);
    return () => mobile.removeEventListener("change", closeOnResize);
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const closeOnOutside = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) dispatch(navigationMenuClosed());
    };
    const closeOnFocusOutside = (event: FocusEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) dispatch(navigationMenuClosed());
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      dispatch(navigationMenuClosed());
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("focusin", closeOnFocusOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("focusin", closeOnFocusOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dispatch, isOpen]);

  function onNavigate() {
    if (!isOpen) return;
    dispatch(navigationMenuClosed());
    toggleRef.current?.focus();
  }

  return (
    <div className={styles.headerControls} ref={wrapRef}>
      <nav
        id="site-navigation"
        ref={navRef}
        className={`${styles.nav} ${isOpen ? styles.navOpen : ""}`}
        aria-label={label}
      >
        <span className={styles.navHeading} aria-hidden="true">{label}</span>
        {links.map((link) => {
          const isCurrent = link.key === CURRENT_NAV_KEY;
          const className = `${styles.navLink} ${isCurrent ? styles.navLinkActive : ""}`;
          return link.isInternal ? (
            <Link
              key={link.key}
              href={link.href}
              className={className}
              aria-current={isCurrent ? "page" : undefined}
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          ) : (
            <a key={link.key} href={link.href} className={className} onClick={onNavigate}>
              {link.label}
            </a>
          );
        })}
      </nav>
      <div className={styles.headerActions}>
        {children}
        <button
          ref={toggleRef}
          type="button"
          className={styles.menuToggle}
          aria-label={isOpen ? closeLabel : openLabel}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          onClick={() => dispatch(navigationMenuToggled())}
        >
          <span className={styles.menuIcon} aria-hidden="true"><span /><span /><span /></span>
        </button>
      </div>
    </div>
  );
}
