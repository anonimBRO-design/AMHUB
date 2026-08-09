"use client";

import { useLanguage } from "@/i18n";
import type { User } from "@presethub/types";
import { AlertCircle, Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AccountCard } from "./AccountCard";
import { DangerZone } from "./DangerZone";
import { MobileSettingsView } from "./MobileSettingsView";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsToggle } from "./SettingsToggle";
import { UsernameField } from "./UsernameField";

interface SettingsClientProps {
	profile: User;
}

export function SettingsClient({ profile }: SettingsClientProps) {
	const { language, setLanguage, t } = useLanguage();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [username, setUsername] = useState(profile.username ?? "");
	const [isUsernameValid, setIsUsernameValid] = useState(true);
	const [isUsernameChecking, setIsUsernameChecking] = useState(false);

	const [displayName, setDisplayName] = useState(profile.display_name ?? "");
	const [bio, setBio] = useState(profile.bio ?? "");
	const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");
	const [tiktokHandle, setTiktokHandle] = useState(profile.tiktok_handle ?? "");
	const [instagramHandle, setInstagramHandle] = useState(
		profile.instagram_handle ?? "",
	);
	const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url ?? "");
	const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

	const [pushNotifications, setPushNotifications] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [publicProfile, setPublicProfile] = useState(true);
	const [darkTheme, setDarkTheme] = useState(true);

	const handleAvatarUpload = async (file: File) => {
		setError(null);
		const res = await fetch("/api/uploads/avatar", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				filename: file.name,
				content_type: file.type || "image/jpeg",
				size: file.size,
			}),
		});

		const json = await res.json();
		if (!res.ok) {
			throw new Error(json.error?.message || "Failed to prepare avatar upload");
		}

		await fetch(json.data.upload_url, {
			method: "PUT",
			headers: { "Content-Type": file.type || "image/jpeg" },
			body: file,
		});

		setAvatarUrl(json.data.storage_path);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!isUsernameValid || isUsernameChecking) return;

		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const res = await fetch(`/api/users/${profile.username}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: username.trim().toLowerCase(),
					display_name: displayName.trim() || profile.display_name,
					bio: bio.trim() || null,
					avatar_url: avatarUrl.trim() || null,
					website_url: websiteUrl.trim() || null,
					tiktok_handle: tiktokHandle.trim() || null,
					instagram_handle: instagramHandle.trim() || null,
					youtube_url: youtubeUrl.trim() || null,
				}),
			});

			const json = await res.json();
			if (!res.ok) {
				throw new Error(
					json.error?.message || "Failed to update profile settings",
				);
			}

			setSuccessMessage("Settings updated successfully!");
			router.refresh();
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Failed to update profile.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			{/* Dedicated Native Mobile Composition (max-width: 768px) */}
			<MobileSettingsView profile={profile} />

			{/* Desktop and Tablet Layout (Hidden on Mobile) */}
			<form
				onSubmit={handleSubmit}
				className="hidden md:block space-y-6 max-w-2xl mx-auto"
			>
				<div className="space-y-1 px-1">
					<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
						<Sparkles className="w-4 h-4" />
						<span>Account & Preferences</span>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						Settings
					</h1>
				</div>

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

				<AccountCard
					username={username || profile.username}
					displayName={displayName || profile.display_name || profile.username}
					avatarUrl={avatarUrl}
					onAvatarUpload={handleAvatarUpload}
				/>

				<SettingsGroup title="Public Profile Information">
					<div className="p-4 space-y-4">
						<UsernameField
							value={username}
							initialUsername={profile.username}
							onChange={setUsername}
							onValidityChange={(isValid, isChecking) => {
								setIsUsernameValid(isValid);
								setIsUsernameChecking(isChecking);
							}}
						/>

						<div className="space-y-1.5">
							<label
								htmlFor="settings-display-name"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Display Name *
							</label>
							<input
								id="settings-display-name"
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								required
								className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="settings-bio"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Bio
							</label>
							<textarea
								id="settings-bio"
								rows={3}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell the community about yourself..."
								className="w-full p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)] resize-none"
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="settings-website"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Website URL
							</label>
							<input
								id="settings-website"
								type="url"
								value={websiteUrl}
								onChange={(e) => setWebsiteUrl(e.target.value)}
								placeholder="https://yourwebsite.com"
								className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label
									htmlFor="settings-tiktok"
									className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
								>
									TikTok Handle
								</label>
								<input
									id="settings-tiktok"
									type="text"
									value={tiktokHandle}
									onChange={(e) => setTiktokHandle(e.target.value)}
									placeholder="@username"
									className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="settings-instagram"
									className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
								>
									Instagram Handle
								</label>
								<input
									id="settings-instagram"
									type="text"
									value={instagramHandle}
									onChange={(e) => setInstagramHandle(e.target.value)}
									placeholder="@username"
									className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="settings-youtube"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								YouTube URL
							</label>
							<input
								id="settings-youtube"
								type="url"
								value={youtubeUrl}
								onChange={(e) => setYoutubeUrl(e.target.value)}
								placeholder="https://youtube.com/@channel"
								className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>
					</div>
				</SettingsGroup>

				<SettingsGroup title="Notifications & Alerts">
					<div className="p-4 space-y-4 text-xs">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Push Notifications
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									Get notified on new likes, comments, and followers.
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
									Weekly summary of creator preset performance.
								</span>
							</div>
							<SettingsToggle
								checked={emailNotifications}
								onChange={setEmailNotifications}
							/>
						</div>
					</div>
				</SettingsGroup>

				<SettingsGroup title="Privacy & Interface">
					<div className="p-4 space-y-4 text-xs">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<span className="font-bold text-[var(--color-text-primary)] block">
									Public Profile Visibility
								</span>
								<span className="text-[var(--color-text-tertiary)] block">
									Allow visitors to find your profile in explore search.
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
									Premium high-contrast dark theme (Default active).
								</span>
							</div>
							<SettingsToggle checked={darkTheme} onChange={setDarkTheme} />
						</div>
					</div>
				</SettingsGroup>

				<DangerZone />

				<div className="mt-8 mb-24 sm:mb-28 flex items-center justify-end gap-3 max-w-2xl mx-auto">
					<button
						type="submit"
						disabled={isLoading || !isUsernameValid || isUsernameChecking}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-xl shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all disabled:opacity-50"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Saving Changes...</span>
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
