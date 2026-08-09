"use client";

import * as React from "react";
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

export const TopBar = ({ pageTitle, isScrolled, rightContent }: TopBarProps) => {
	return (
		<header
			className={cn(
				"sticky top-0 z-[var(--z-sticky)] flex h-16 w-full items-center justify-between px-4 sm:px-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-2xl bg-[#08070c]/80 border-b border-white/[0.08]",
				isScrolled &&
					"shadow-[0_8px_32px_rgba(0,0,0,0.6)] bg-[#08070c]/90 border-white/[0.12]",
			)}
		>
			{/* Brand Area — AMHUB Logo & AMHUB Text */}
			<div className="flex items-center gap-3">
				<a
					href="/home"
					aria-label="AMHUB — Home"
					className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 active:scale-[0.97]"
				>
					<div className="relative p-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 shadow-[0_0_16px_rgba(124,58,237,0.3)]">
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
