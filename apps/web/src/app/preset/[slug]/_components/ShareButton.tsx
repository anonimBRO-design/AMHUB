"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
	title: string;
	url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		const shareUrl =
			url || (typeof window !== "undefined" ? window.location.href : "");

		if (navigator.share) {
			try {
				await navigator.share({
					title: title,
					text: `Check out "${title}" Alight Motion preset on AMHUB!`,
					url: shareUrl,
				});
				return;
			} catch {
				// User cancelled or share failed, fallback to clipboard
			}
		}

		if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(shareUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (e) {
				console.error("Clipboard copy failed", e);
			}
		}
	};

	return (
		<button
			type="button"
			onClick={handleShare}
			aria-label="Share preset"
			className="inline-flex items-center justify-center min-h-[42px] min-w-[42px] px-3.5 rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] active:scale-95 transition-all duration-200"
		>
			{copied ? (
				<Check className="w-5 h-5 text-emerald-400" />
			) : (
				<Share2 className="w-5 h-5" />
			)}
		</button>
	);
}
