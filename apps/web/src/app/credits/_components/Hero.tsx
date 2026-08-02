import { Heart, Sparkles } from "lucide-react";

export function Hero() {
	return (
		<div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--color-bg-elevated)] via-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-center space-y-4 shadow-2xl">
			<div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--color-interactive-primary)]/15 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

			<div className="relative z-10 space-y-3 max-w-xl mx-auto">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20 text-xs font-bold uppercase tracking-wider">
					<Sparkles className="w-3.5 h-3.5" />
					<span>Version 1.0 Production Release</span>
				</div>

				<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
					AMHUB Credits & Acknowledgments
				</h1>

				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					Celebrating the creators, open-source technologies, and AI agents that
					built the ultimate platform for Alight Motion editors worldwide.
				</p>
			</div>
		</div>
	);
}
