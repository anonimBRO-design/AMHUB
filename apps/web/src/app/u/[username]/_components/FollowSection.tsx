"use client";

import { useAuth } from "@/context/AuthContext";
import {
	Check,
	Copy,
	Settings,
	Share2,
	UserCheck,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FollowSectionProps {
	username: string;
	isOwnProfile: boolean;
	initialFollowing?: boolean;
}

export function FollowSection({
	username,
	isOwnProfile,
	initialFollowing = false,
}: FollowSectionProps) {
	const [isFollowing, setIsFollowing] = useState(initialFollowing);
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const { requireAuth } = useAuth();

	const handleFollowToggle = async () => {
		if (!requireAuth(undefined, "Sign in to follow creators")) return;
		setIsLoading(true);
		const nextState = !isFollowing;
		setIsFollowing(nextState);

		try {
			await fetch(`/api/users/${username}/follow`, {
				method: nextState ? "POST" : "DELETE",
			});
		} catch (e) {
			console.error("Failed to toggle follow", e);
			setIsFollowing(!nextState);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = async () => {
		const profileUrl =
			typeof window !== "undefined" ? window.location.href : "";
		try {
			await navigator.clipboard.writeText(profileUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			console.error("Failed to copy link", e);
		}
	};

	const handleShare = async () => {
		const profileUrl =
			typeof window !== "undefined" ? window.location.href : "";
		if (navigator.share) {
			try {
				await navigator.share({
					title: `@${username} on AMHUB`,
					text: `Check out @${username}'s Alight Motion presets on AMHUB!`,
					url: profileUrl,
				});
				return;
			} catch {
				// Fallback to clipboard if share cancelled
			}
		}
		handleCopy();
	};

	return (
		<div className="flex items-center gap-2">
			{isOwnProfile ? (
				<Link
					href="/settings"
					className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-bold text-xs border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] active:scale-95 transition-all"
				>
					<Settings className="w-4 h-4" />
					<span>Edit Profile Settings</span>
				</Link>
			) : (
				<button
					type="button"
					onClick={handleFollowToggle}
					disabled={isLoading}
					className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
						isFollowing
							? "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
							: "bg-[var(--color-interactive-primary)] text-white hover:bg-[var(--color-interactive-primary-hover)] shadow-[var(--color-interactive-primary)]/25"
					}`}
				>
					{isFollowing ? (
						<>
							<UserCheck className="w-4 h-4 text-emerald-400" />
							<span>Following</span>
						</>
					) : (
						<>
							<UserPlus className="w-4 h-4" />
							<span>Follow Creator</span>
						</>
					)}
				</button>
			)}

			<button
				type="button"
				onClick={handleShare}
				aria-label="Share profile"
				className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all"
			>
				<Share2 className="w-4 h-4" />
			</button>

			<button
				type="button"
				onClick={handleCopy}
				aria-label="Copy profile URL"
				className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all"
			>
				{copied ? (
					<Check className="w-4 h-4 text-emerald-400" />
				) : (
					<Copy className="w-4 h-4" />
				)}
			</button>
		</div>
	);
}
