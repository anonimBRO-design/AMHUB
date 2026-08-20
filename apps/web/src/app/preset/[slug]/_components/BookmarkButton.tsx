"use client";

import { useAuth } from "@/context/AuthContext";
import { Bookmark } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

interface BookmarkButtonProps {
	presetId: string;
	initialBookmarked?: boolean;
	count?: number;
	onBookmark?: (presetId: string) => void;
	onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({
	presetId,
	initialBookmarked = false,
	count,
	onBookmark,
	onBookmarkChange,
}: BookmarkButtonProps) {
	const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
	const [currentCount, setCurrentCount] = useState(count ?? 0);
	const [isLoading, setIsLoading] = useState(false);
	const { requireAuth } = useAuth();

	const handleToggle = async () => {
		if (!requireAuth(undefined, "Sign in to bookmark presets")) return;
		setIsLoading(true);
		const nextState = !isBookmarked;
		setIsBookmarked(nextState);
		setCurrentCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
		onBookmarkChange?.(nextState);

		try {
			const endpoint = `/api/presets/${presetId}/bookmark`;
			const response = await fetch(endpoint, {
				method: nextState ? "POST" : "DELETE",
			});
			if (!response.ok) throw new Error("Failed to toggle bookmark");
			posthog.capture(
				nextState ? "preset_bookmarked" : "preset_bookmark_removed",
				{ preset_id: presetId },
			);
			onBookmark?.(presetId);
		} catch (error) {
			console.error("Failed to toggle bookmark", error);
			setIsBookmarked(!nextState); // Rollback on error
			setCurrentCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
			onBookmarkChange?.(!nextState);
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
			className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 rounded-lg border transition-all duration-200 active:scale-95 shadow-sm font-body ${
				isBookmarked
					? "bg-amber-500/15 text-amber-400 border-amber-500/30"
					: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
			}`}
		>
			<Bookmark
				className={`w-4 h-4 transition-colors ${
					isBookmarked ? "fill-amber-400 text-amber-400" : ""
				}`}
			/>
			{count !== undefined && (
				<span className="text-xs font-bold">{currentCount}</span>
			)}
		</button>
	);
}
