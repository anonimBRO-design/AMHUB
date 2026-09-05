"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import React from "react";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const isDark = theme === "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] text-[var(--color-text-primary)] transition-all duration-200 active:scale-90 shrink-0 shadow-sm cursor-pointer"
			title={
				isDark
					? "Theme: Dark (Klik untuk Light)"
					: "Theme: Light (Klik untuk Dark)"
			}
			aria-label="Toggle Theme Mode"
		>
			{isDark ? (
				<Moon className="w-4 h-4 text-cyan-300 transition-transform duration-300 rotate-0 hover:-rotate-12" />
			) : (
				<Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45" />
			)}
		</button>
	);
}
