"use client";

import { useLanguage } from "@/i18n";
import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import type { User } from "@presethub/types";
import {
	AlertCircle,
	Check,
	Globe,
	Instagram,
	Loader2,
	User as UserIcon,
	Youtube,
} from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { type FormEvent, useState } from "react";
import { AccountCard } from "./AccountCard";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsTabsHeader } from "./SettingsTabsHeader";
import { UsernameField } from "./UsernameField";

interface EditProfileClientProps {
	profile: User;
}

export function EditProfileClient({ profile }: EditProfileClientProps) {
	const { t } = useLanguage();
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
	const [bannerUrl, setBannerUrl] = useState(profile.banner_url ?? "");

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

	const handleBannerUpload = async (file: File) => {
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
			throw new Error(json.error?.message || "Failed to prepare banner upload");
		}

		await fetch(json.data.upload_url, {
			method: "PUT",
			headers: { "Content-Type": file.type || "image/jpeg" },
			body: file,
		});

		setBannerUrl(json.data.storage_path);
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
					banner_url: bannerUrl.trim() || null,
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

			posthog.capture("profile_updated", {
				username_changed: username.trim().toLowerCase() !== profile.username,
				avatar_updated: avatarUrl !== profile.avatar_url,
				banner_updated: bannerUrl !== profile.banner_url,
			});

			setSuccessMessage(t.settings.savedSuccess || "Profile updated successfully!");

			if (username.trim().toLowerCase() !== profile.username) {
				router.push(`/u/${username.trim().toLowerCase()}`);
			} else {
				router.refresh();
			}
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Failed to update profile.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6 max-w-2xl mx-auto px-4 sm:px-0 pb-28 pt-2 font-body">
			<SettingsTabsHeader
				title="Edit Creator Profile"
				subtitle="Customize your public avatar, banner background, bio, and social channels."
				badgeText="Profile Customization"
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

				{/* Avatar Card */}
				<AccountCard
					username={username || profile.username}
					displayName={displayName || profile.display_name || profile.username}
					avatarUrl={avatarUrl}
					onAvatarUpload={handleAvatarUpload}
				/>

				{/* Banner Background */}
				<SettingsGroup title="Profile Background Banner">
					<div className="p-4 space-y-4">
						<p className="text-xs text-[var(--color-text-tertiary)]">
							Upload an image for your creator profile header banner.
						</p>

						{/* Banner Preview */}
						<div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
							{bannerUrl ? (
								<>
									<img
										src={resolveStorageUrl(bannerUrl) || bannerUrl}
										alt="Profile banner preview"
										className="absolute inset-0 w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
								</>
							) : (
								<div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-violet-900/60 flex items-center justify-center">
									<span className="text-xs text-white/60 font-semibold">
										Default Gradient Banner
									</span>
								</div>
							)}
						</div>

						{/* Upload / Remove Buttons */}
						<div className="flex items-center gap-3">
							<label
								htmlFor="banner-upload-file"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--color-interactive-primary)] text-white text-xs font-bold cursor-pointer hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all shadow-md"
							>
								Upload Banner
							</label>
							<input
								id="banner-upload-file"
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onChange={async (e) => {
									if (e.target.files?.[0]) {
										try {
											await handleBannerUpload(e.target.files[0]);
										} catch (err) {
											console.error("Banner upload failed", err);
											setError(
												err instanceof Error
													? err.message
													: "Failed to upload banner",
											);
										}
									}
								}}
								className="hidden"
							/>
							{bannerUrl && (
								<button
									type="button"
									onClick={() => setBannerUrl("")}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all"
								>
									Remove Banner
								</button>
							)}
						</div>
					</div>
				</SettingsGroup>

				{/* Public Profile Details */}
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
								placeholder="Tell the Alight Motion community about yourself..."
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
								YouTube Channel URL
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

				{/* Action CTA */}
				<div className="flex items-center justify-end gap-3 pt-2">
					<button
						type="submit"
						disabled={isLoading || !isUsernameValid || isUsernameChecking}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-xl shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Saving Profile...</span>
							</>
						) : (
							<span>Save Profile Changes</span>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
