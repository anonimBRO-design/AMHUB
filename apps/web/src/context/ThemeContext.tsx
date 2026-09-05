"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "amhub_theme_mode_v3";

function normalizeSavedTheme(saved: string | null): ThemeMode {
	if (saved === "light" || saved === "light-liquid") return "light";
	return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<ThemeMode>("dark");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(THEME_STORAGE_KEY);
			const mode = normalizeSavedTheme(saved);
			setThemeState(mode);
			applyThemeToDOM(mode);
		} catch {
			applyThemeToDOM("dark");
		}
		setMounted(true);
	}, []);

	const applyThemeToDOM = (mode: ThemeMode) => {
		if (typeof document === "undefined") return;
		document.documentElement.setAttribute("data-theme", mode);
		document.documentElement.classList.remove("dark", "light");
		document.documentElement.classList.add(mode);
	};

	const setTheme = (mode: ThemeMode) => {
		setThemeState(mode);
		applyThemeToDOM(mode);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch {}
	};

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<ThemeContext.Provider
			value={{ theme: mounted ? theme : "dark", setTheme, toggleTheme }}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
