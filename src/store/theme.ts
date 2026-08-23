import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
export type Theme = "light" | "dark";
const themeSlice = createSlice({ name: "theme", initialState: { value: "light" as Theme, ready: false }, reducers: {
  hydrateTheme(state, action: PayloadAction<Theme>) { state.value = action.payload; state.ready = true; },
  setTheme(state, action: PayloadAction<Theme>) { state.value = action.payload; state.ready = true; },
}});
export const { hydrateTheme, setTheme } = themeSlice.actions;
export const store = configureStore({ reducer: { theme: themeSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export function readThemeCookie(): Theme | null { const m = document.cookie.match(/(?:^|; )twinkle-theme=([^;]*)/); const v = m ? decodeURIComponent(m[1]) : null; return v === "light" || v === "dark" ? v : null; }
export function persistTheme(theme: Theme) { const h = window.location.hostname; const d = h === "localhost" || h === "127.0.0.1" || h.endsWith(".localhost") ? "" : "; domain=.twinklelabs.kr"; document.cookie = `twinkle-theme=${theme}${d}; path=/; max-age=31536000; SameSite=Lax`; document.documentElement.setAttribute("data-theme", theme); }
