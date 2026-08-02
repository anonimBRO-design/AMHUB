"use client";

import type { User } from "@presethub/types";
import {
	Bell,
	FileText,
	HelpCircle,
	Paintbrush,
	Shield,
	Smartphone,
	User as UserIcon,
} from "lucide-react";
import React, { useState } from "react";
import { SettingsToggle } from "./SettingsToggle";

interface MobileSettingsViewProps {
	profile: User;
}

export function MobileSettingsView({ profile }: MobileSettingsViewProps) {
	const [darkMode, setDarkMode] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(true);
	const [dataSaver, setDataSaver] = useState(false);
	const [privateProfile, setPrivateProfile] = useState(false);

	return (
		<div className="md:hidden space-y-8 px-4 pb-32 pt-4">
			{/* Profile Header */}
			<div className="flex items-center gap-4 rounded-3xl bg-[var(--color-bg-surface)] p-5 shadow-xl border border-[var(--color-border-subtle)]">
				<div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-interactive-primary)] bg-[var(--color-bg-elevated)]">
					{profile.avatar_url ? (
						<img
							src={profile.avatar_url}
							alt={profile.display_name || profile.username}
							className="w-full h-full object-cover"
						/>
					) : (
						<UserIcon className="h-full w-full p-3 text-[var(--color-text-tertiary)]" />
					)}
				</div>
				<div>
					<h1 className="text-lg font-bold text-[var(--color-text-primary)]">
						{profile.display_name || profile.username}
					</h1>
					<p className="text-[15px] font-medium text-[var(--color-text-tertiary)]">
						@{profile.username}
					</p>
				</div>
			</div>

			{/* Settings Groups */}
			<div className="space-y-6">
				{/* App Settings */}
				<div className="space-y-2">
					<h2 className="px-2 text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
						App Settings
					</h2>
					<div className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-subtle)] shadow-sm">
						<div className="flex items-center justify-between p-5">
							<div className="flex items-center gap-3">
								<Paintbrush className="h-5 w-5 text-[var(--color-text-secondary)]" />
								<span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
									Dark Mode
								</span>
							</div>
							<SettingsToggle checked={darkMode} onChange={setDarkMode} />
						</div>
						<div className="flex items-center justify-between p-5">
							<div className="flex items-center gap-3">
								<Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
								<span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
									Push Notifications
								</span>
							</div>
							<SettingsToggle
								checked={pushNotifications}
								onChange={setPushNotifications}
							/>
						</div>
						<div className="flex items-center justify-between p-5">
							<div className="flex items-center gap-3">
								<Smartphone className="h-5 w-5 text-[var(--color-text-secondary)]" />
								<span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
									Data Saver
								</span>
							</div>
							<SettingsToggle checked={dataSaver} onChange={setDataSaver} />
						</div>
					</div>
				</div>

				{/* Account & Privacy */}
				<div className="space-y-2">
					<h2 className="px-2 text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
						Account & Privacy
					</h2>
					<div className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-subtle)] shadow-sm">
						<div className="flex items-center justify-between p-5">
							<div className="flex items-center gap-3">
								<Shield className="h-5 w-5 text-[var(--color-text-secondary)]" />
								<span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
									Private Profile
								</span>
							</div>
							<SettingsToggle
								checked={privateProfile}
								onChange={setPrivateProfile}
							/>
						</div>
						<button
							type="button"
							className="flex w-full items-center justify-between p-5 active:bg-[var(--color-bg-elevated)]"
						>
							<div className="flex items-center gap-3">
								<FileText className="h-5 w-5 text-[var(--color-text-secondary)]" />
								<span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
									Terms of Service
								</span>
							</div>
						</button>
						<button
							type="button"
							className="flex w-full items-center justify-between p-5 active:bg-[var(--color-bg-elevated)]"
						>
							<div className="flex items-center gap-3">
								<HelpCircle className="h-5 w-5 text-[var(--color-text-secondary)]" />
								<span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
									Help & Support
								</span>
							</div>
						</button>
					</div>
				</div>
			</div>

			{/* Sign out */}
			<button
				type="button"
				className="w-full min-h-[56px] rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[15px] font-bold text-rose-500 shadow-sm active:scale-[0.98] transition-transform"
			>
				Sign Out
			</button>
		</div>
	);
}
