"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { type Translations, en } from "./en";
import { id } from "./id";

export type Language = "en" | "id";

type LanguageContextValue = {
	language: Language;
	setLanguage: (language: Language) => void;
	t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
	undefined,
);

const STORAGE_KEY = "amhub_language_preference";

function detectLanguage(): Language {
	if (typeof navigator === "undefined") {
		return "en";
	}

	return navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
}

export function LanguageProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [language, setLanguageState] = useState<Language>("en");

	useEffect(() => {
		const saved = window.localStorage.getItem(STORAGE_KEY);

		if (saved === "en" || saved === "id") {
			setLanguageState(saved);
		} else {
			setLanguageState(detectLanguage());
		}
	}, []);

	const setLanguage = useCallback((nextLanguage: Language) => {
		setLanguageState(nextLanguage);
		window.localStorage.setItem(STORAGE_KEY, nextLanguage);
	}, []);

	const t = useMemo(() => (language === "id" ? id : en), [language]);

	const value = useMemo(
		() => ({
			language,
			setLanguage,
			t,
		}),
		[language, setLanguage, t],
	);

	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);

	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}

	return context;
}
