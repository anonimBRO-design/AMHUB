"use client";

import { isAdminProfile } from "@/lib/admin";
import { useLanguage } from "@/i18n";
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
			id: "upload",
			label: t.common.upload,
			href: "/upload",
			icon: PlusCircle,
			isSpecial: true,
		},
		{
			id: "bookmarks",
			label: t.common.bookmarks,
			href: "/bookmarks",
			icon: Bookmark,
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
		<div className="flex fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none max-w-[98vw] sm:max-w-none">
			<motion.div
				initial={{ y: 40, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="relative flex items-center gap-0.5 sm:gap-1.5 p-1 sm:p-2 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
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
							className="relative group"
							onMouseEnter={() => setHoveredId(item.id)}
							onMouseLeave={() => setHoveredId(null)}
						>
							{/* Tooltip Bubble */}
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

							{/* macOS Dock Magnification Link Item */}
							<Link
								href={item.href}
								className="relative flex flex-col items-center justify-center min-w-[34px] min-h-[34px] sm:min-w-[48px] sm:min-h-[48px] p-0.5 sm:p-2.5 rounded-2xl transition-all duration-200"
							>
								<motion.div
									animate={{
										scale: isHovered ? 1.2 : 1,
										y: isHovered ? -3 : 0,
									}}
									transition={{ type: "spring", stiffness: 400, damping: 25 }}
									className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-2xl transition-colors duration-200 overflow-hidden ${
										item.isSpecial
											? "bg-[var(--color-interactive-primary)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[var(--color-border-accent)]"
											: isActive
												? "bg-[var(--color-bg-elevated)] text-white border border-[var(--color-border-strong)] shadow-sm"
												: "bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] hover:text-white"
									}`}
								>
									{item.id === "profile" && item.avatarUrl ? (
										<img
											src={item.avatarUrl}
											alt={item.label}
											className="w-full h-full object-cover rounded-2xl"
										/>
									) : (
										<Icon className="w-4 h-4 sm:w-5 sm:h-5" />
									)}

									{/* Badge Dot */}
									{item.badge && item.badge > 0 ? (
										<span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] sm:text-[10px] font-black text-white shadow-sm border border-black">
											{item.badge > 9 ? "9+" : item.badge}
										</span>
									) : null}
								</motion.div>

								{/* Active Route Dot Indicator */}
								{isActive && (
									<motion.div
										layoutId="activeDockDot"
										className="absolute bottom-0.5 sm:bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400"
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
