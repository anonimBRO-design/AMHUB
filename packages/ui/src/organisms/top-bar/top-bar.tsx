"use client";

import { ArrowLeft } from "lucide-react";
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
	showBackButton?: boolean;
	onBackClick?: () => void;
	onSearchSubmit?: (query: string) => void;
	rightContent?: React.ReactNode;
}

export const TopBar = ({
	pageTitle,
	isScrolled,
	showBackButton = false,
	onBackClick,
	rightContent,
}: TopBarProps) => {
	return (
		<header
			className={cn(
				"sticky top-0 z-[100] flex h-16 w-full items-center justify-between px-4 sm:px-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ios-glass-panel border-b border-[var(--color-border-subtle)]",
				isScrolled &&
					"shadow-[var(--shadow-sm)] border-[var(--color-border-default)]",
			)}
		>
			{/* Brand Area — AMHUB Logo & AMHUB Text */}
			<div className="flex items-center gap-2.5">
				{showBackButton && (
					<button
						type="button"
						onClick={onBackClick}
						aria-label="Kembali ke halaman sebelumnya"
						className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-white transition-all active:scale-90 shrink-0 shadow-sm"
					>
						<ArrowLeft className="w-4 h-4" />
					</button>
				)}

				<a
					href="/home"
					aria-label="AMHUB — Home"
					className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 active:scale-[0.97]"
				>
					<div
						className="relative p-1.5 rounded-xl bg-[var(--color-interactive-primary)]/10 border border-[var(--color-border-accent)]/20 shrink-0 flex items-center justify-center overflow-hidden"
						style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
					>
						<img
							src="/logo.png"
							alt="AMHUB Logo"
							width={28}
							height={28}
							className="h-7 w-7 object-contain rounded-lg shrink-0"
							style={{ width: 28, height: 28, maxWidth: 28, maxHeight: 28 }}
						/>
					</div>

					<span className="font-display text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
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

