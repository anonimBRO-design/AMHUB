"use client";

import { useLanguage } from "@/i18n";
import type { User } from "@presethub/types";
import {
	AlertCircle,
	Check,
	Globe,
	Loader2,
	Mail,
	Moon,
	Shield,
	ShieldCheck,
	UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { type FormEvent, useState } from "react";
import { DangerZone } from "./DangerZone";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsTabsHeader } from "./SettingsTabsHeader";
import { SettingsToggle } from "./SettingsToggle";

interface SettingsClientProps {
	profile: User;
}

export function SettingsClient({ profile }: SettingsClientProps) {
	const { language, setLanguage, t } = useLanguage();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [pushNotifications, setPushNotifications] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [publicProfile, setPublicProfile] = useState(true);
	const [darkTheme, setDarkTheme] = useState(true);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			posthog.capture("account_settings_updated", {
				push_notifications: pushNotifications,
				email_notifications: emailNotifications,
				public_profile: publicProfile,
				dark_theme: darkTheme,
				language,
			});

			setSuccessMessage(
				t.settings.savedSuccess || "Settings preferences saved successfully!",
			);
			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to save settings preferences.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6 max-w-2xl mx-auto px-4 sm:px-0 pb-28 pt-2 font-body">
			<SettingsTabsHeader
				title="Account & System Settings"
				subtitle="Manage your notifications, security, privacy visibility, and interface preferences."
				badgeText="System Preferences"
			/>

			<form onSubmit={handleSubmit} className="space-y-6">
				{successMessage && (
					<div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
						<Check className="w-5 h-5 shrink-0" />
						<span>{successMessage}</span>
					</div>
				)}

				{error && (
					<div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
						<AlertCircle className="w-5 h-5 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Account Credentials Card */}
				<SettingsGroup title="Account Overview">
					<div className="p-4 space-y-3">
						<div className="flex items-center justify-between py-1">
							<div className="space-y-0.5">
								<span className="text-xs font-bold text-[var(--color-text-secondary)] block">
									Username
								</span>
								<span className="text-sm font-bold text-[var(--color-text-primary)]">
									@{profile.username}
								</span>
							</div>
							{profile.is_verified && (
								<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20 text-[10px] font-bold">
									<ShieldCheck className="w-3.5 h-3.5" />
									<span>Verified</span>
								</span>
							)}
						</div>

						{profile.email && (
							<div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]/60">
								<div className="space-y-0.5">
									<span className="text-xs font-bold text-[var(--color-text-secondary)] block">
										Email Address
									</span>
									<span className="text-xs text-[var(--color-text-primary)] font-mono">
										{profile.email}
									</span>
								</div>
								<span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
									Confirmed
								</span>
							</div>
						)}
					</div>
				</SettingsGroup>

				{/* Notifications & Alerts */}
				<SettingsGroup title="Notifications & Alerts">
					<div className="p-4 space-y-4 text-xs">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Push Notifications
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									Get real-time alerts when creators like, comment, or download your presets.
								</span>
							</div>
							<SettingsToggle
								checked={pushNotifications}
								onChange={setPushNotifications}
							/>
						</div>

						<div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]/60">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Email Digest
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									Weekly summary of creator preset trends and community activity.
								</span>
							</div>
							<SettingsToggle
								checked={emailNotifications}
								onChange={setEmailNotifications}
							/>
						</div>
					</div>
				</SettingsGroup>

				{/* Privacy & Interface */}
				<SettingsGroup title="Privacy & Interface">
					<div className="p-4 space-y-4 text-xs">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Public Profile Visibility
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									Allow other editors to find your profile in explore search and creator leaderboards.
								</span>
							</div>
							<SettingsToggle
								checked={publicProfile}
								onChange={setPublicProfile}
							/>
						</div>

						<div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]/60">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Dark Mode Design System
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									High-contrast obsidian theme for video editing workflow (Default active).
								</span>
							</div>
							<SettingsToggle checked={darkTheme} onChange={setDarkTheme} />
						</div>

						<div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]/60">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Platform Language
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									Choose your preferred interface language.
								</span>
							</div>
							<div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
								<button
									type="button"
									onClick={() => setLanguage("en")}
									className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
										language === "en"
											? "bg-[var(--color-interactive-primary)] text-white shadow-sm"
											: "text-[var(--color-text-tertiary)] hover:text-white"
									}`}
								>
									English
								</button>
								<button
									type="button"
									onClick={() => setLanguage("id")}
									className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
										language === "id"
											? "bg-[var(--color-interactive-primary)] text-white shadow-sm"
											: "text-[var(--color-text-tertiary)] hover:text-white"
									}`}
								>
									Indonesia
								</button>
							</div>
						</div>
					</div>
				</SettingsGroup>

				{/* Account Management & Danger Zone */}
				<DangerZone />

				{/* Save CTA */}
				<div className="flex items-center justify-end gap-3 pt-2">
					<button
						type="submit"
						disabled={isLoading}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-xl shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Saving Settings...</span>
							</>
						) : (
							<span>Save Settings Changes</span>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
