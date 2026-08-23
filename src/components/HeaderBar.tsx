"use client";

import { useEffect, useState } from "react";
import styles from "@/app/layout.module.css";

export default function HeaderBar({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>{children}</header>;
}
