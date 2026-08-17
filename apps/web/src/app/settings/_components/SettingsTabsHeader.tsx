"use client";

import { Settings, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsTabsHeaderProps {
	title: string;
	subtitle: string;
	badgeText?: string;
}

export function SettingsTabsHeader({
	title,
	subtitle,
	badgeText = "Account & Preferences",
}: SettingsTabsHeaderProps) {
	const pathname = usePathname();
	const isProfileTab = pathname === "/settings/profile";

	return (
		<div className="space-y-6 max-w-2xl mx-auto px-1">
			{/* Page Header */}
			<div className="space-y-1">
				<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
					<Sparkles className="w-4 h-4" />
					<span>{badgeText}</span>
				</div>
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-display">
					{title}
				</h1>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-body">
					{subtitle}
				</p>
			</div>

			{/* Segmented Pill Tab Switcher */}
			<div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md">
				<Link
					href="/settings/profile"
					className={`flex-1 flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
						isProfileTab
							? "bg-[var(--color-interactive-primary)] text-white shadow-lg shadow-[var(--color-interactive-primary)]/25"
							: "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
					}`}
				>
					<User className="w-4 h-4" />
					<span>Edit Profile</span>
				</Link>

				<Link
					href="/settings"
					className={`flex-1 flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
						!isProfileTab
							? "bg-[var(--color-interactive-primary)] text-white shadow-lg shadow-[var(--color-interactive-primary)]/25"
							: "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
					}`}
				>
					<Settings className="w-4 h-4" />
					<span>Account Settings</span>
				</Link>
			</div>
		</div>
	);
}
