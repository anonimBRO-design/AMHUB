"use client";

import { useLanguage } from "@/i18n";
import { isAdminProfile } from "@/lib/admin";
import type { User } from "@presethub/types";
import { AnimatePresence, motion } from "framer-motion";
import {
	Bell,
	Bookmark,
	Compass,
	Heart,
	LayoutDashboard,
	PlusCircle,
	ShieldAlert,
	Sparkles,
	User as UserIcon,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface DesktopDockProps {
	currentUser?: User | null;
	unreadNotificationCount?: number;
}

interface DockItem {
	id: string;
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: number;
	isSpecial?: boolean;
	avatarUrl?: string | null;
}

export function DesktopDock({
	currentUser,
	unreadNotificationCount = 0,
}: DesktopDockProps) {
	const { t } = useLanguage();
	const pathname = usePathname();
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const profileHref = currentUser
		? `/u/${currentUser.username}`
		: "/auth/login";

	const isAdmin = isAdminProfile(currentUser);

	const dockItems: DockItem[] = [
		{
			id: "home",
			label: t.common.home,
			href: "/home",
			icon: Sparkles,
		},
		{
			id: "explore",
			label: t.common.explore,
			href: "/explore",
			icon: Compass,
		},
		{
			id: "creators",
			label: "Kreator",
			href: "/creators",
			icon: Users,
		},
		{
			id: "bookmarks",
			label: t.common.bookmarks,
			href: "/bookmarks",
			icon: Bookmark,
		},
		{
			id: "upload",
			label: t.common.upload,
			href: "/upload",
			icon: PlusCircle,
			isSpecial: true,
		},
		{
			id: "likes",
			label: t.common.likes,
			href: "/likes",
			icon: Heart,
		},
		{
			id: "notifications",
			label: t.common.notifications,
			href: "/notifications",
			icon: Bell,
			badge: unreadNotificationCount,
		},
		{
			id: "dashboard",
			label: t.common.dashboard,
			href: "/dashboard",
			icon: LayoutDashboard,
		},
	];

	if (isAdmin) {
		dockItems.push({
			id: "admin",
			label: "Admin",
			href: "/admin",
			icon: ShieldAlert,
		});
	}

	dockItems.push({
		id: "profile",
		label: currentUser ? currentUser.display_name : t.common.login,
		href: profileHref,
		icon: UserIcon,
		avatarUrl: currentUser?.avatar_url,
	});

	return (
		<div className="flex fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none w-[calc(100%-12px)] sm:w-auto max-w-3xl sm:max-w-none justify-center">
			<motion.div
				initial={{ y: 40, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="relative flex items-center justify-between sm:justify-center w-full sm:w-auto gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-2xl bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border border-[var(--color-border-strong)] shadow-[0_12px_40px_rgba(0,0,0,0.65)] overflow-x-auto no-scrollbar"
			>
				{dockItems.map((item) => {
					const Icon = item.icon;
					const isActive =
						pathname === item.href ||
						(item.href === "/home" && pathname === "/");
					const isHovered = hoveredId === item.id;

					return (
						<div
							key={item.id}
							className="relative group flex-1 sm:flex-none flex items-center justify-center"
							onMouseEnter={() => setHoveredId(item.id)}
							onMouseLeave={() => setHoveredId(null)}
						>
							{/* Tooltip Bubble (Desktop only) */}
							<AnimatePresence>
								{isHovered && (
									<motion.div
										initial={{ opacity: 0, y: 6, scale: 0.9 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 4, scale: 0.95 }}
										transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
										className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden sm:block"
									>
										<div className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-xl flex items-center gap-1.5 whitespace-nowrap">
											<span className="text-xs font-bold text-[var(--color-text-primary)] font-body tracking-wide">
												{item.label}
											</span>
										</div>
										<div className="w-2 h-2 bg-[var(--color-bg-surface)] rotate-45 border-r border-b border-[var(--color-border-default)] mx-auto -mt-1" />
									</motion.div>
								)}
							</AnimatePresence>

							{/* Dock Item Button */}
							<Link
								href={item.href}
								aria-label={item.label}
								className="relative flex flex-col items-center justify-center w-full min-w-[38px] sm:min-w-[48px] h-12 sm:h-13 p-0.5 sm:p-2 rounded-xl transition-all duration-200"
							>
								<motion.div
									animate={{
										scale: isHovered ? 1.18 : 1,
										y: isHovered ? -2 : 0,
									}}
									transition={{ type: "spring", stiffness: 400, damping: 25 }}
									className={`relative flex items-center justify-center rounded-xl transition-colors duration-200 overflow-hidden ${
										item.isSpecial
											? "w-11 h-11 sm:w-11 sm:h-11 bg-[var(--color-interactive-primary)] text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[var(--color-border-accent)] scale-105"
											: isActive
												? "w-10 h-10 sm:w-10 sm:h-10 bg-[var(--color-bg-elevated)] text-white border border-[var(--color-border-strong)] shadow-sm"
												: "w-10 h-10 sm:w-10 sm:h-10 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] hover:text-white"
									}`}
								>
									{item.id === "profile" && item.avatarUrl ? (
										<img
											src={item.avatarUrl}
											alt={item.label}
											className="w-full h-full object-cover rounded-xl"
										/>
									) : (
										<Icon
											className={
												item.isSpecial
													? "w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[2.2]"
													: "w-5 h-5 sm:w-5.5 sm:h-5.5"
											}
										/>
									)}

									{/* Badge Dot */}
									{item.badge && item.badge > 0 ? (
										<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-black text-white shadow-sm border border-black">
											{item.badge > 9 ? "9+" : item.badge}
										</span>
									) : null}
								</motion.div>

								{/* Active Route Dot Indicator */}
								{isActive && (
									<motion.div
										layoutId="activeDockDot"
										className="absolute bottom-0 sm:bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-interactive-primary)]"
										transition={{ type: "spring", stiffness: 500, damping: 30 }}
									/>
								)}
							</Link>
						</div>
					);
				})}
			</motion.div>
		</div>
	);
}
