"use client";

import {
	Check,
	Copy,
	Download,
	ExternalLink,
	FileCode,
	Info,
	QrCode,
	Smartphone,
} from "lucide-react";
import { useState } from "react";

interface InstallSectionProps {
	preset: {
		id: string;
		title: string;
		fileType?: "xml" | "qr" | "link" | string;
		fileUrl?: string | null;
		amLink?: string | null;
	};
}

export function InstallSection({ preset }: InstallSectionProps) {
	const [copied, setCopied] = useState(false);

	const linkToCopy =
		preset.amLink ||
		preset.fileUrl ||
		(typeof window !== "undefined" ? window.location.href : "");

	const handleCopy = async () => {
		if (!linkToCopy) return;
		try {
			await navigator.clipboard.writeText(linkToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			console.error("Failed to copy link", e);
		}
	};

	return (
		<section className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-5 shadow-lg">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						<Download className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
							Download & Import
						</h2>
						<p className="text-xs text-[var(--color-text-secondary)]">
							1-Tap Alight Motion Project Import
						</p>
					</div>
				</div>
				<span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
					{preset.fileType?.toUpperCase() || "XML"}
				</span>
			</div>

			{/* Main CTAs */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{preset.amLink && (
					<a
						href={preset.amLink}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-sm shadow-xl shadow-[var(--color-interactive-primary)]/25 hover:bg-[var(--color-interactive-primary-hover)] active:scale-[0.98] transition-all"
					>
						<ExternalLink className="w-5 h-5" />
						<span>Open Alight Motion Link</span>
					</a>
				)}

				{preset.fileUrl && (
					<a
						href={preset.fileUrl}
						download
						className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-bold text-sm border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] active:scale-[0.98] transition-all"
					>
						{preset.fileType === "qr" ? (
							<QrCode className="w-5 h-5 text-purple-400" />
						) : (
							<FileCode className="w-5 h-5 text-blue-400" />
						)}
						<span>Download {preset.fileType?.toUpperCase() || "File"}</span>
					</a>
				)}
			</div>

			{/* 1-Click Copy Box */}
			{linkToCopy && (
				<div className="space-y-2 pt-2">
					<span className="block text-xs font-semibold text-[var(--color-text-secondary)]">
						Direct Link / Import URL
					</span>
					<div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
						<code className="flex-1 text-xs text-[var(--color-text-secondary)] truncate px-2 font-mono">
							{linkToCopy}
						</code>
						<button
							type="button"
							onClick={handleCopy}
							className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] active:scale-95 transition-all shrink-0"
						>
							{copied ? (
								<>
									<Check className="w-4 h-4 text-emerald-400" />
									<span className="text-emerald-400">Copied!</span>
								</>
							) : (
								<>
									<Copy className="w-4 h-4" />
									<span>Copy</span>
								</>
							)}
						</button>
					</div>
				</div>
			)}

			{/* Quick How-to Steps */}
			<div className="p-4 rounded-2xl bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 space-y-2">
				<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
					<Smartphone className="w-4 h-4 text-indigo-400" />
					<span>How to Import into Alight Motion</span>
				</div>
				<ol className="list-decimal list-inside text-xs text-[var(--color-text-secondary)] space-y-1.5 leading-relaxed pl-1">
					<li>
						Tap <strong>Open Alight Motion Link</strong> or download the XML/QR
						file.
					</li>
					<li>
						If using XML, open Alight Motion &gt; Project &gt; Import XML file.
					</li>
					<li>
						If using QR Code, scan the image using the Alight Motion QR scanner.
					</li>
				</ol>
			</div>
		</section>
	);
}
