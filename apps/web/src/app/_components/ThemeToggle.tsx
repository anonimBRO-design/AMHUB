"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sparkles, Sun } from "lucide-react";
import React from "react";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] text-[var(--color-text-primary)] transition-all duration-200 active:scale-90 shrink-0 shadow-sm cursor-pointer"
			title={
				theme === "normal"
					? "Theme: Normal (Klik untuk Dark Liquid)"
					: theme === "dark-liquid"
					? "Theme: Dark Liquid (Klik untuk Light Liquid)"
					: "Theme: Light Liquid (Klik untuk Normal)"
			}
			aria-label="Toggle Theme Mode"
		>
			{theme === "normal" ? (
				<Moon className="w-4 h-4 text-purple-300 transition-transform duration-300 rotate-0 hover:-rotate-12" />
			) : theme === "dark-liquid" ? (
				<Sparkles className="w-4 h-4 text-fuchsia-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
			) : (
				<Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45" />
			)}
		</button>
	);
}
