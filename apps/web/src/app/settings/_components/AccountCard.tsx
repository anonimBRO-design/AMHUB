"use client";

import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import { Camera, Check, Loader2 } from "lucide-react";
import { type ChangeEvent, useState } from "react";

interface AccountCardProps {
	username: string;
	displayName: string;
	avatarUrl?: string | null;
	onAvatarUpload: (file: File) => Promise<void>;
}

export function AccountCard({
	username,
	displayName,
	avatarUrl,
	onAvatarUpload,
}: AccountCardProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploaded, setUploaded] = useState(false);

	const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			setIsUploading(true);
			try {
				await onAvatarUpload(file);
				setUploaded(true);
				setTimeout(() => setUploaded(false), 2000);
			} catch (err) {
				console.error("Avatar upload failed", err);
			} finally {
				setIsUploading(false);
			}
		}
	};

	return (
		<div className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-xl">
			<div className="flex items-center gap-4 sm:gap-6">
				<div className="relative shrink-0">
					<img
						src={
							resolveStorageUrl(avatarUrl) ||
							`https://api.dicebear.com/7.x/identicon/svg?seed=${username}`
						}
						alt={displayName}
						className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]/40 shadow-lg"
					/>
					<label
						htmlFor="avatar-card-file"
						className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-lg cursor-pointer hover:bg-[var(--color-interactive-primary-hover)] active:scale-90 transition-all"
					>
						{isUploading ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : uploaded ? (
							<Check className="w-3.5 h-3.5" />
						) : (
							<Camera className="w-3.5 h-3.5" />
						)}
					</label>
					<input
						id="avatar-card-file"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onChange={handleFileSelect}
						className="hidden"
					/>
				</div>

				<div className="space-y-1 min-w-0">
					<h2 className="text-lg sm:text-xl font-extrabold text-[var(--color-text-primary)] truncate">
						{displayName}
					</h2>
					<p className="text-xs font-semibold text-[var(--color-text-tertiary)]">
						@{username}
					</p>
					<span className="inline-block text-[11px] text-[var(--color-interactive-primary)] font-semibold pt-0.5">
						Tap camera icon to change avatar
					</span>
				</div>
			</div>
		</div>
	);
}
