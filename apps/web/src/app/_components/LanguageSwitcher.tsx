"use client";

import { type Language, useLanguage } from "@/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LanguageSwitcherProps {
	/**
	 * Compact mode for top navigation bar.
	 * Full mode shows complete label names (e.g. "English", "Bahasa Indonesia").
	 */
	variant?: "compact" | "full";
	/**
	 * Dropdown direction relative to button.
	 * "up" opens upward (useful for bottom dock/navbars).
	 * "down" opens downward (default for top header).
	 */
	position?: "up" | "down";
	className?: string;
}

export function LanguageSwitcher({
	variant = "compact",
	position = "down",
	className = "",
}: LanguageSwitcherProps) {
	const { language, setLanguage, t } = useLanguage();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const languages: { code: Language; label: string; flag: string }[] = [
		{ code: "en", label: t.common.english, flag: "🇺🇸" },
		{ code: "id", label: t.common.indonesian, flag: "🇮🇩" },
	];

	// Close menu on click outside or Escape key
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: globalThis.KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const isUp = position === "up";

	return (
		<div
			ref={dropdownRef}
			className={`relative inline-block text-left ${className}`}
		>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				aria-haspopup="true"
				aria-label={t.settings.languageSelect || "Select language"}
				className={`flex items-center gap-1.5 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer ${
					variant === "compact"
						? "px-2.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-white"
						: "px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-white shadow-md"
				}`}
			>
				<Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
				<span className="uppercase font-mono tracking-wider">{language}</span>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: isUp ? -6 : 6, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: isUp ? -4 : 4, scale: 0.95 }}
						transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
						className={`absolute right-0 w-44 z-50 py-1.5 rounded-2xl bg-[#0e0d14]/95 border border-white/15 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(124,58,237,0.15)] focus:outline-none overflow-hidden ${
							isUp ? "bottom-full mb-2" : "mt-2"
						}`}
					>
						{languages.map((lang) => {
							const isSelected = language === lang.code;
							return (
								<div key={lang.code}>
									<button
										type="button"
										onClick={() => {
											setLanguage(lang.code);
											setIsOpen(false);
										}}
										className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer ${
											isSelected
												? "bg-purple-600/20 text-purple-300 font-bold"
												: "text-gray-300 hover:bg-white/[0.08] hover:text-white"
										}`}
									>
										<span className="flex items-center gap-2">
											<span className="text-sm">{lang.flag}</span>
											<span>{lang.label}</span>
										</span>
										{isSelected && (
											<Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
										)}
									</button>
								</div>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
