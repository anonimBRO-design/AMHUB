"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "normal" | "dark-liquid" | "light-liquid";

interface ThemeContextType {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "amhub_theme_mode_v2";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<ThemeMode>("normal");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
			if (saved && ["normal", "dark-liquid", "light-liquid"].includes(saved)) {
				setThemeState(saved);
				applyThemeToDOM(saved);
			} else {
				applyThemeToDOM("normal");
			}
		} catch {
			applyThemeToDOM("normal");
		}
		setMounted(true);
	}, []);

	const applyThemeToDOM = (mode: ThemeMode) => {
		if (typeof document === "undefined") return;
		document.documentElement.setAttribute("data-theme", mode);
		document.documentElement.classList.remove("dark", "light");
		if (mode === "light-liquid") {
			document.documentElement.classList.add("light");
		} else {
			document.documentElement.classList.add("dark");
		}
	};

	const setTheme = (mode: ThemeMode) => {
		setThemeState(mode);
		applyThemeToDOM(mode);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch {}
	};

	const toggleTheme = () => {
		let next: ThemeMode = "normal";
		if (theme === "normal") next = "dark-liquid";
		else if (theme === "dark-liquid") next = "light-liquid";
		else next = "normal";
		setTheme(next);
	};

	return (
		<ThemeContext.Provider value={{ theme: mounted ? theme : "normal", setTheme, toggleTheme }}>
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
