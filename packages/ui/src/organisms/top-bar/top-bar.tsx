"use client";

import type * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface TopBarProps {
	currentUser?: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		level: number;
	};
	pageTitle?: string;
	unreadNotificationCount?: number;
	isScrolled?: boolean;
	onSearchSubmit?: (query: string) => void;
	rightContent?: React.ReactNode;
}

export const TopBar = ({
	pageTitle,
	isScrolled,
	rightContent,
}: TopBarProps) => {
	return (
		<header
			className={cn(
				"sticky top-0 z-[100] flex h-16 w-full items-center justify-between px-4 sm:px-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[var(--color-bg-base)] border-b border-[var(--color-border-subtle)]",
				isScrolled &&
					"shadow-[var(--shadow-sm)] bg-[var(--color-bg-elevated)] border-[var(--color-border-default)]",
			)}
		>
			{/* Brand Area — AMHUB Logo & AMHUB Text */}
			<div className="flex items-center gap-3">
				<a
					href="/home"
					aria-label="AMHUB — Home"
					className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 active:scale-[0.97]"
				>
					<div className="relative p-1.5 rounded-xl bg-[var(--color-interactive-primary)]/10 border border-[var(--color-border-accent)]/20">
						<img
							src="/logo.png"
							alt="AMHUB Logo"
							className="h-7 w-7 object-contain rounded-lg"
						/>
					</div>
					<span className="font-display text-xl font-extrabold tracking-tight text-white">
						{pageTitle || "AMHUB"}
					</span>
				</a>
			</div>
			{rightContent && (
				<div className="flex items-center gap-3">{rightContent}</div>
			)}
		</header>
	);
};
