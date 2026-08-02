"use client";

import type { User } from "@presethub/types";
import {
	Bell,
	ChevronRight,
	Lock,
	Moon,
	Shield,
	User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { SettingsToggle } from "./SettingsToggle";

interface MobileSettingsViewProps {
	profile: User;
}

export function MobileSettingsView({ profile }: MobileSettingsViewProps) {
	const [pushEnabled, setPushEnabled] = useState(true);
	const [publicProfile, setPublicProfile] = useState(true);
	const [darkMode, setDarkMode] = useState(true);

	return (
		<div className="md:hidden space-y-5 pb-28">
			{/* Profile Header */}
			<div className="flex items-center gap-4 p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<img
					src={
						profile.avatar_url ||
						`https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`
					}
					alt={profile.display_name}
					className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]"
				/>
				<div className="min-w-0 flex-1">
					<h1 className="text-base font-extrabold text-[var(--color-text-primary)] truncate">
						{profile.display_name}
					</h1>
					<p className="text-xs text-[var(--color-text-tertiary)]">
						@{profile.username}
					</p>
				</div>
			</div>

			{/* iOS Settings Group 1: Preferences */}
			<div className="space-y-2">
				<span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-tertiary)] px-2">
					App Preferences
				</span>
				<div className="rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]/60 shadow-lg text-xs">
					<div className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<Bell className="w-4 h-4 text-purple-400" />
							<span className="font-bold text-[var(--color-text-primary)]">
								Push Notifications
							</span>
						</div>
						<SettingsToggle checked={pushEnabled} onChange={setPushEnabled} />
					</div>

					<div className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<Shield className="w-4 h-4 text-emerald-400" />
							<span className="font-bold text-[var(--color-text-primary)]">
								Public Profile
							</span>
						</div>
						<SettingsToggle
							checked={publicProfile}
							onChange={setPublicProfile}
						/>
					</div>

					<div className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<Moon className="w-4 h-4 text-indigo-400" />
							<span className="font-bold text-[var(--color-text-primary)]">
								Dark Mode
							</span>
						</div>
						<SettingsToggle checked={darkMode} onChange={setDarkMode} />
					</div>
				</div>
			</div>

			{/* iOS Settings Group 2: Account Actions */}
			<div className="space-y-2">
				<span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-tertiary)] px-2">
					Account & Safety
				</span>
				<div className="rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]/60 shadow-lg text-xs">
					<button
						type="button"
						onClick={async () => {
							await fetch("/auth/logout", { method: "POST" });
							window.location.href = "/auth/login";
						}}
						className="w-full flex items-center justify-between p-4 font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
					>
						<span>Sign Out</span>
						<ChevronRight className="w-4 h-4 text-rose-400" />
					</button>
				</div>
			</div>
		</div>
	);
}
