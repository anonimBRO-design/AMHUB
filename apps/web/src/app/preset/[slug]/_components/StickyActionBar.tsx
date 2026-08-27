"use client";

import { useAuth } from "@/context/AuthContext";
import {
	Bookmark,
	Check,
	Copy,
	Download,
	ExternalLink,
	Heart,
	Lock,
	MessageSquare,
} from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

interface StickyActionBarProps {
	preset: {
		id: string;
		title: string;
		fileUrl?: string | null;
		amLink?: string | null;
		isLiked?: boolean;
		isBookmarked?: boolean;
		price?: number;
		isPaid?: boolean;
		hasAccess?: boolean;
	};
}

export function StickyActionBar({ preset }: StickyActionBarProps) {
	const { requireAuth } = useAuth();
	const [isLiked, setIsLiked] = useState(preset.isLiked ?? false);
	const [isBookmarked, setIsBookmarked] = useState(
		preset.isBookmarked ?? false,
	);
	const [copied, setCopied] = useState(false);

	const handleLikeToggle = async () => {
		if (!requireAuth(undefined, "Sign in to like presets")) return;
		const nextState = !isLiked;
		setIsLiked(nextState);

		try {
			const res = await fetch(`/api/presets/${preset.id}/like`, {
				method: nextState ? "POST" : "DELETE",
			});
			if (!res.ok) throw new Error("Failed to toggle like");
			posthog.capture(nextState ? "preset_liked" : "preset_unliked", {
				preset_id: preset.id,
			});
		} catch (e) {
			console.error("Failed to toggle like", e);
			setIsLiked(!nextState);
		}
	};

	const handleBookmarkToggle = async () => {
		if (!requireAuth(undefined, "Sign in to bookmark presets")) return;
		const nextState = !isBookmarked;
		setIsBookmarked(nextState);

		try {
			const res = await fetch(`/api/presets/${preset.id}/bookmark`, {
				method: nextState ? "POST" : "DELETE",
			});
			if (!res.ok) throw new Error("Failed to toggle bookmark");
			posthog.capture(
				nextState ? "preset_bookmarked" : "preset_bookmark_removed",
				{ preset_id: preset.id },
			);
		} catch (e) {
			console.error("Failed to toggle bookmark", e);
			setIsBookmarked(!nextState);
		}
	};

	const isLocked = Boolean(preset.isPaid && !preset.hasAccess);

	const handleCopy = async () => {
		const link = isLocked
			? typeof window !== "undefined"
				? window.location.href
				: ""
			: preset.amLink || preset.fileUrl || window.location.href;
		try {
			await navigator.clipboard.writeText(link);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			console.error("Failed to copy", e);
		}
	};

	const mainDownloadUrl = preset.amLink || preset.fileUrl || "#";

	return (
		<div className="mt-6 p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg sm:hidden transition-all">
			<div className="flex items-center gap-2 max-w-lg mx-auto">
				{/* Primary Action Button (Download / Import or Buy) */}
				{isLocked ? (
					<button
						type="button"
						onClick={() => {
							const target = document.querySelector("section");
							target?.scrollIntoView({ behavior: "smooth" });
						}}
						className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
					>
						<Lock className="w-4 h-4" />
						<span>
							Beli Preset • Rp {(preset.price ?? 0).toLocaleString("id-ID")}
						</span>
					</button>
				) : (
					<a
						href={mainDownloadUrl}
						target={preset.amLink ? "_blank" : undefined}
						rel={preset.amLink ? "noopener noreferrer" : undefined}
						download={!preset.amLink && preset.fileUrl ? true : undefined}
						className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-md shadow-[var(--color-interactive-primary)]/30 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
					>
						{preset.amLink ? (
							<ExternalLink className="w-4 h-4" />
						) : (
							<Download className="w-4 h-4" />
						)}
						<span>{preset.amLink ? "Open Link" : "Download XML"}</span>
					</a>
				)}

				{/* Copy Button */}
				<button
					type="button"
					onClick={handleCopy}
					aria-label="Copy import link"
					className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] active:scale-95 transition-all"
				>
					{copied ? (
						<Check className="w-4 h-4 text-emerald-400" />
					) : (
						<Copy className="w-4 h-4" />
					)}
				</button>

				{/* Like Button */}
				<button
					type="button"
					onClick={handleLikeToggle}
					aria-label={isLiked ? "Unlike preset" : "Like preset"}
					className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border active:scale-95 transition-all ${
						isLiked
							? "bg-rose-500/10 text-rose-400 border-rose-500/30"
							: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
					}`}
				>
					<Heart
						className={`w-4 h-4 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`}
					/>
				</button>

				{/* Bookmark Button */}
				<button
					type="button"
					onClick={handleBookmarkToggle}
					aria-label={isBookmarked ? "Remove bookmark" : "Bookmark preset"}
					className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border active:scale-95 transition-all ${
						isBookmarked
							? "bg-amber-500/10 text-amber-400 border-amber-500/30"
							: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
					}`}
				>
					<Bookmark
						className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`}
					/>
				</button>

				{/* Comment Button */}
				<button
					type="button"
					onClick={() => {
						const commentElem = document.getElementById("comments-section");
						if (commentElem) {
							commentElem.scrollIntoView({ behavior: "smooth" });
							const inputElem = commentElem.querySelector("input");
							if (inputElem) inputElem.focus();
						}
					}}
					aria-label="View comments"
					className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-blue-400 active:scale-95 transition-all"
				>
					<MessageSquare className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
