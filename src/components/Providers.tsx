"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { hydrateTheme, readThemeCookie, store } from "@/store/theme";
export default function Providers({ children }: { children: React.ReactNode }) { useEffect(() => { const theme = readThemeCookie() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); store.dispatch(hydrateTheme(theme)); document.documentElement.setAttribute("data-theme", theme); }, []); return <Provider store={store}>{children}</Provider>; }
