import {
	ArrowRight,
	ShieldCheck,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";

export function Hero() {
	return (
		<section className="relative overflow-hidden pt-4 pb-8 md:py-12 px-4 sm:px-6 text-center md:text-left rounded-3xl bg-gradient-to-b from-[var(--color-bg-elevated)]/80 via-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-border-subtle)] shadow-2xl backdrop-blur-xl">
			{/* Ambient Gradient Glow Background */}
			<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--color-interactive-primary)]/15 blur-[120px] pointer-events-none rounded-full" />

			<div className="relative z-10 max-w-4xl mx-auto md:mx-0 flex flex-col md:flex-row items-center justify-between gap-8">
				<div className="space-y-4 max-w-xl text-center md:text-left">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20 shadow-sm transition-all duration-300 hover:scale-105">
						<Sparkles className="w-3.5 h-3.5 animate-pulse text-[var(--color-interactive-primary)]" />
						<span>Alight Motion Preset Hub #1</span>
					</div>

					{/* Title */}
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
						Elevate Your Edits with <br className="hidden sm:inline" />
						<span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
							Pro Alight Motion
						</span>{" "}
						Presets
					</h1>

					{/* Subtitle */}
					<p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-normal">
						Discover XML, QR codes, and 1-tap links. Download trending velocity,
						transition, and color grading presets created by top editors.
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 pt-2">
						<Link
							href="/explore"
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-semibold text-sm shadow-lg shadow-[var(--color-interactive-primary)]/25 hover:bg-[var(--color-interactive-primary-hover)] active:scale-[0.98] transition-all duration-200"
						>
							<span>Explore Catalog</span>
							<ArrowRight className="w-4 h-4" />
						</Link>
						<Link
							href="/upload"
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-semibold text-sm border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] active:scale-[0.98] transition-all duration-200"
						>
							<Zap className="w-4 h-4 text-amber-400" />
							<span>Upload Preset</span>
						</Link>
					</div>
				</div>

				{/* Stat Cards Grid (Mobile Compact / Desktop Card) */}
				<div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto pt-2 md:pt-0">
					<div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-[var(--color-bg-base)]/80 border border-[var(--color-border-subtle)] shadow-inner transition-all hover:border-[var(--color-interactive-primary)]/30">
						<div className="flex items-center gap-1 text-emerald-400 font-extrabold text-lg sm:text-2xl">
							<TrendingUp className="w-4 h-4 hidden sm:inline" />
							<span>12K+</span>
						</div>
						<span className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
							Presets
						</span>
					</div>

					<div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-[var(--color-bg-base)]/80 border border-[var(--color-border-subtle)] shadow-inner transition-all hover:border-[var(--color-interactive-primary)]/30">
						<div className="flex items-center gap-1 text-indigo-400 font-extrabold text-lg sm:text-2xl">
							<ShieldCheck className="w-4 h-4 hidden sm:inline" />
							<span>45K+</span>
						</div>
						<span className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
							Creators
						</span>
					</div>

					<div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-[var(--color-bg-base)]/80 border border-[var(--color-border-subtle)] shadow-inner transition-all hover:border-[var(--color-interactive-primary)]/30">
						<div className="flex items-center gap-1 text-purple-400 font-extrabold text-lg sm:text-2xl">
							<Zap className="w-4 h-4 hidden sm:inline" />
							<span>1.5M+</span>
						</div>
						<span className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
							Downloads
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
