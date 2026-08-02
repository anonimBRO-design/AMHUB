"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

interface BookmarkButtonProps {
	presetId: string;
	initialBookmarked?: boolean;
	onBookmark?: (presetId: string) => void;
}

export function BookmarkButton({
	presetId,
	initialBookmarked = false,
	onBookmark,
}: BookmarkButtonProps) {
	const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
	const [isLoading, setIsLoading] = useState(false);

	const handleToggle = async () => {
		setIsLoading(true);
		const nextState = !isBookmarked;
		setIsBookmarked(nextState);

		try {
			const endpoint = `/api/presets/${presetId}/bookmark`;
			await fetch(endpoint, { method: nextState ? "POST" : "DELETE" });
			onBookmark?.(presetId);
		} catch (error) {
			console.error("Failed to toggle bookmark", error);
			setIsBookmarked(!nextState); // Rollback on error
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={isLoading}
			aria-label={isBookmarked ? "Remove bookmark" : "Bookmark preset"}
			className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3.5 rounded-2xl border transition-all duration-200 active:scale-95 ${
				isBookmarked
					? "bg-amber-500/10 text-amber-400 border-amber-500/30"
					: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
			}`}
		>
			<Bookmark
				className={`w-5 h-5 ${isBookmarked ? "fill-amber-400 text-amber-400 animate-pulse" : ""}`}
			/>
		</button>
	);
}
