"use client";

import {
	Bookmark,
	Check,
	Copy,
	Download,
	ExternalLink,
	Heart,
	Share2,
} from "lucide-react";
import { useState } from "react";

interface StickyActionBarProps {
	preset: {
		id: string;
		title: string;
		fileType?: string;
		fileUrl?: string | null;
		amLink?: string | null;
		isLiked?: boolean;
		isBookmarked?: boolean;
	};
}

export function StickyActionBar({ preset }: StickyActionBarProps) {
	const [isLiked, setIsLiked] = useState(preset.isLiked ?? false);
	const [isBookmarked, setIsBookmarked] = useState(
		preset.isBookmarked ?? false,
	);
	const [copied, setCopied] = useState(false);

	const handleLikeToggle = async () => {
		const nextState = !isLiked;
		setIsLiked(nextState);
		try {
			await fetch(`/api/presets/${preset.id}/like`, {
				method: nextState ? "POST" : "DELETE",
			});
		} catch (e) {
			console.error("Failed to toggle like", e);
			setIsLiked(!nextState);
		}
	};

	const handleBookmarkToggle = async () => {
		const nextState = !isBookmarked;
		setIsBookmarked(nextState);
		try {
			await fetch(`/api/presets/${preset.id}/bookmark`, {
				method: nextState ? "POST" : "DELETE",
			});
		} catch (e) {
			console.error("Failed to toggle bookmark", e);
			setIsBookmarked(!nextState);
		}
	};

	const handleCopy = async () => {
		const urlToCopy =
			preset.amLink ||
			preset.fileUrl ||
			(typeof window !== "undefined" ? window.location.href : "");
		try {
			await navigator.clipboard.writeText(urlToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			console.error("Failed to copy", e);
		}
	};

	const mainDownloadUrl = preset.amLink || preset.fileUrl || "#";

	return (
		<div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden p-3 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border-subtle)] shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] transition-all">
			<div className="flex items-center gap-2 max-w-lg mx-auto">
				{/* Primary Action Button (Download / Import) */}
				<a
					href={mainDownloadUrl}
					target={preset.amLink ? "_blank" : undefined}
					rel={preset.amLink ? "noopener noreferrer" : undefined}
					download={!preset.amLink && preset.fileUrl ? true : undefined}
					className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-sm shadow-lg shadow-[var(--color-interactive-primary)]/30 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
				>
					{preset.amLink ? (
						<ExternalLink className="w-5 h-5" />
					) : (
						<Download className="w-5 h-5" />
					)}
					<span>{preset.amLink ? "Open Link" : "Download XML"}</span>
				</a>

				{/* Copy Button */}
				<button
					type="button"
					onClick={handleCopy}
					aria-label="Copy import link"
					className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] active:scale-95 transition-all"
				>
					{copied ? (
						<Check className="w-5 h-5 text-emerald-400" />
					) : (
						<Copy className="w-5 h-5" />
					)}
				</button>

				{/* Like Button */}
				<button
					type="button"
					onClick={handleLikeToggle}
					aria-label={isLiked ? "Unlike preset" : "Like preset"}
					className={`inline-flex items-center justify-center min-h-[48px] min-w-[48px] rounded-2xl border active:scale-95 transition-all ${
						isLiked
							? "bg-rose-500/10 text-rose-400 border-rose-500/30"
							: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
					}`}
				>
					<Heart
						className={`w-5 h-5 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`}
					/>
				</button>

				{/* Bookmark Button */}
				<button
					type="button"
					onClick={handleBookmarkToggle}
					aria-label={isBookmarked ? "Remove bookmark" : "Bookmark preset"}
					className={`inline-flex items-center justify-center min-h-[48px] min-w-[48px] rounded-2xl border active:scale-95 transition-all ${
						isBookmarked
							? "bg-amber-500/10 text-amber-400 border-amber-500/30"
							: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
					}`}
				>
					<Bookmark
						className={`w-5 h-5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`}
					/>
				</button>
			</div>
		</div>
	);
}
