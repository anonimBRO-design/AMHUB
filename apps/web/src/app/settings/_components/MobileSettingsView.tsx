import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import type { User } from "@presethub/types";
import { AlertCircle, Check, Loader2, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { SettingsToggle } from "./SettingsToggle";
import { UsernameField } from "./UsernameField";

interface MobileSettingsViewProps {
	profile: User;
}

export function MobileSettingsView({ profile }: MobileSettingsViewProps) {
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

	const [darkMode, setDarkMode] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(true);
	const [dataSaver, setDataSaver] = useState(false);
	const [privateProfile, setPrivateProfile] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
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
					website_url: websiteUrl.trim() || null,
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
		<div className="md:hidden space-y-6 px-4 pt-4">
			{/* Profile Header */}
			<div className="flex items-center gap-4 rounded-3xl bg-[var(--color-bg-surface)] p-5 shadow-xl border border-[var(--color-border-subtle)]">
				<div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-interactive-primary)] bg-[var(--color-bg-elevated)] shrink-0">
					{profile.avatar_url ? (
						<img
							src={resolveStorageUrl(profile.avatar_url) || ""}
							alt={profile.display_name || profile.username}
							className="w-full h-full object-cover"
						/>
					) : (
						<UserIcon className="h-full w-full p-3 text-[var(--color-text-tertiary)]" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<h1 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
						{displayName || profile.display_name || profile.username}
					</h1>
					<p className="text-[15px] font-medium text-[var(--color-text-tertiary)] truncate">
						@{username || profile.username}
					</p>
				</div>
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

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Public Profile Form */}
				<div className="space-y-2">
					<h2 className="px-2 text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
						Public Profile Information
					</h2>
					<div className="rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-sm">
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
								htmlFor="mobile-settings-display-name"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Display Name *
							</label>
							<input
								id="mobile-settings-display-name"
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								required
								className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="mobile-settings-bio"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Bio
							</label>
							<textarea
								id="mobile-settings-bio"
								rows={3}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell the community about yourself..."
								className="w-full p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)] resize-none"
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="mobile-settings-website"
								className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Website URL
							</label>
							<input
								id="mobile-settings-website"
								type="url"
								value={websiteUrl}
								onChange={(e) => setWebsiteUrl(e.target.value)}
								placeholder="https://yourwebsite.com"
								className="w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>
					</div>
				</div>

				<div className="pt-2 mb-24">
					<button
						type="submit"
						disabled={isLoading || !isUsernameValid || isUsernameChecking}
						className="w-full min-h-[48px] rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Saving...</span>
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
