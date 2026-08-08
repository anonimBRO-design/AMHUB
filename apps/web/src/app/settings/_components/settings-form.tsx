"use client";

import type { User } from "@presethub/types";
import { Avatar, Button, Input } from "@presethub/ui";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { UsernameField } from "./UsernameField";

interface SettingsFormProps {
	profile: User;
}

export function SettingsForm({ profile }: SettingsFormProps) {
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

	const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !e.target.files[0]) return;
		const file = e.target.files[0];
		setError(null);

		try {
			// 1. Prepare avatar upload
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
				throw new Error(
					json.error?.message || "Failed to prepare avatar upload",
				);
			}

			// 2. Put file to storage
			await fetch(json.data.upload_url, {
				method: "PUT",
				headers: { "Content-Type": file.type || "image/jpeg" },
				body: file,
			});

			setAvatarUrl(json.data.storage_path);
			setSuccessMessage(
				"Avatar image uploaded successfully! Don't forget to save changes.",
			);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to upload avatar.");
		}
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

			setSuccessMessage("Profile settings updated successfully!");
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
		<form
			onSubmit={handleSubmit}
			className="space-y-6 max-w-2xl mx-auto p-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)]"
		>
			<h1 className="text-2xl font-bold">Account Settings</h1>

			{successMessage && (
				<div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 rounded-md">
					{successMessage}
				</div>
			)}

			{error && (
				<div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
					{error}
				</div>
			)}

			{/* Avatar Upload */}
			<div className="flex items-center gap-6 pb-4 border-b border-[var(--color-border-subtle)]">
				<Avatar
					src={avatarUrl || undefined}
					displayName={displayName || profile.username}
					alt={`${displayName}'s profile photo`}
					size="xl"
				/>
				<div>
					<label
						htmlFor="avatar-upload"
						className="block text-sm font-medium mb-1"
					>
						Profile Photo
					</label>
					<input
						id="avatar-upload"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onChange={handleAvatarChange}
						className="text-xs text-[var(--color-text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-interactive-primary)] file:text-white hover:file:bg-[var(--color-interactive-primary-hover)] cursor-pointer"
					/>
				</div>
			</div>

			<div className="space-y-4">
				<UsernameField
					value={username}
					initialUsername={profile.username}
					onChange={setUsername}
					onValidityChange={(isValid, isChecking) => {
						setIsUsernameValid(isValid);
						setIsUsernameChecking(isChecking);
					}}
				/>

				<Input
					label="Display Name"
					value={displayName}
					onChange={setDisplayName}
					isRequired
				/>

				<div>
					<label htmlFor="bio-input" className="block text-sm font-medium mb-1">
						Bio
					</label>
					<textarea
						id="bio-input"
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						rows={3}
						className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2 text-sm text-[var(--color-text-primary)]"
						placeholder="Tell the community about yourself..."
					/>
				</div>

				<Input
					label="Website URL"
					type="url"
					value={websiteUrl}
					onChange={setWebsiteUrl}
					placeholder="https://yourwebsite.com"
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						label="TikTok Handle"
						value={tiktokHandle}
						onChange={setTiktokHandle}
						placeholder="@username"
					/>
					<Input
						label="Instagram Handle"
						value={instagramHandle}
						onChange={setInstagramHandle}
						placeholder="@username"
					/>
				</div>

				<Input
					label="YouTube URL"
					type="url"
					value={youtubeUrl}
					onChange={setYoutubeUrl}
					placeholder="https://youtube.com/@channel"
				/>
			</div>

			<div className="flex justify-end pt-4 border-t border-[var(--color-border-subtle)]">
				<Button
					type="submit"
					isLoading={isLoading}
					isDisabled={isLoading || !isUsernameValid || isUsernameChecking}
				>
					Save Changes
				</Button>
			</div>
		</form>
	);
}
