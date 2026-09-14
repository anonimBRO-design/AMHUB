"use client";

import { useLanguage } from "@/i18n";
import {
	Activity,
	Check,
	Copy,
	ExternalLink,
	Music,
	Pause,
	Play,
	Sparkles,
	Volume2,
} from "lucide-react";
import { useRef, useState } from "react";

interface SoundtrackCardProps {
	soundTitle?: string | null;
	soundUrl?: string | null;
	tiktokUrl?: string | null;
	presetTitle: string;
	category?: string;
}

export function SoundtrackCard({
	soundTitle,
	soundUrl,
	tiktokUrl,
	presetTitle,
	category,
}: SoundtrackCardProps) {
	const { t } = useLanguage();
	const [isPlaying, setIsPlaying] = useState(false);
	const [copied, setCopied] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Fallback sound title if not explicitly set
	const displaySoundTitle =
		soundTitle ||
		(category?.toLowerCase() === "jj"
			? `Sound JJ Viral • ${presetTitle.replace(/^preset\s+/i, "")}`
			: `Audio Track • ${presetTitle}`);

	// TikTok sound search URL fallback
	const targetTiktokUrl =
		tiktokUrl ||
		`https://www.tiktok.com/search?q=${encodeURIComponent(
			soundTitle ? `sound ${soundTitle}` : `${presetTitle} alight motion sound`,
		)}`;

	const togglePlay = () => {
		if (!audioRef.current && soundUrl) {
			audioRef.current = new Audio(soundUrl);
			audioRef.current.onended = () => setIsPlaying(false);
		}

		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
				setIsPlaying(false);
			} else {
				audioRef.current
					.play()
					.then(() => setIsPlaying(true))
					.catch(() => setIsPlaying(false));
			}
		}
	};

	const handleCopyTitle = async () => {
		try {
			await navigator.clipboard.writeText(displaySoundTitle);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			console.error("Failed to copy sound title", e);
		}
	};

	return (
		<div className="p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5 min-w-0">
					<div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
						<Music className="w-4 h-4" />
					</div>
					<div className="min-w-0">
						<span className="block text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] tracking-wider">
							{t.presetDetail.soundtrackTitle}
						</span>
						<p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
							{displaySoundTitle}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 shrink-0">
					{soundUrl && (
						<button
							type="button"
							onClick={togglePlay}
							className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all"
							title={isPlaying ? "Pause audio" : "Play audio preview"}
						>
							{isPlaying ? (
								<Pause className="w-4 h-4 fill-current" />
							) : (
								<Play className="w-4 h-4 fill-current ml-0.5" />
							)}
						</button>
					)}

					<button
						type="button"
						onClick={handleCopyTitle}
						className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border-subtle)] active:scale-95 transition-all"
						title="Salin judul sound"
					>
						{copied ? (
							<Check className="w-3.5 h-3.5 text-emerald-400" />
						) : (
							<Copy className="w-3.5 h-3.5" />
						)}
					</button>
				</div>
			</div>

			{/* JJ Beat Waveform & Rhythm Visualizer */}
			<div className="p-2.5 rounded-lg bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 space-y-1.5">
				<div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] font-mono font-semibold">
					<span className="flex items-center gap-1 text-pink-400">
						<Activity className="w-3 h-3 animate-pulse" />
						<span>{t.presetDetail.waveformBpm} (~128 BPM)</span>
					</span>
					<span className="text-amber-400 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
						{t.presetDetail.beatMarkers} (5 Drop)
					</span>
				</div>

				{/* Visual Waveform Bars with Beat Markers */}
				<div className="relative h-8 flex items-end justify-between gap-0.5 px-1 py-1 rounded bg-[var(--color-bg-surface)]/50 overflow-hidden">
					{/* Beat Drop Points Overlay (Yellow Glow Points) */}
					<div className="absolute inset-0 pointer-events-none">
						{[18, 36, 54, 72, 90].map((pct, idx) => (
							<div
								key={idx}
								style={{ left: `${pct}%` }}
								className="absolute top-0 bottom-0 w-px bg-amber-400/30 flex flex-col justify-between items-center"
							>
								<div className="w-1.5 h-1.5 -translate-x-[2px] rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
							</div>
						))}
					</div>

					{/* Amplitude Bars */}
					{[
						35, 65, 45, 80, 100, 50, 75, 90, 100, 60, 45, 85, 95, 100, 55, 40,
						80, 95, 65, 45, 90, 100, 80, 40,
					].map((h, i) => (
						<div
							key={i}
							style={{ height: `${isPlaying ? Math.max(25, h * 0.9) : h}%` }}
							className={`w-full rounded-sm transition-all duration-150 ${
								[4, 8, 12, 17, 21].includes(i)
									? "bg-gradient-to-t from-pink-500 to-amber-400"
									: "bg-pink-500/40 hover:bg-pink-500/70"
							}`}
						/>
					))}
				</div>
			</div>

			{/* TikTok Direct Action */}
			<div className="pt-1 flex items-center justify-between gap-3 text-xs border-t border-[var(--color-border-subtle)]/60">
				<span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
					<Sparkles className="w-3 h-3 text-pink-400" />
					{t.presetDetail.audioTrackDetected}
				</span>

				<a
					href={targetTiktokUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500/15 to-rose-500/15 hover:from-pink-500/25 hover:to-rose-500/25 text-pink-400 hover:text-pink-300 border border-pink-500/30 text-xs font-bold transition-all active:scale-95 group"
				>
					<span>{t.presetDetail.useOnTiktok}</span>
					<ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
				</a>
			</div>
		</div>
	);
}
