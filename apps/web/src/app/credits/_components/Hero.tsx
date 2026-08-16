import { Sparkles } from "lucide-react";

export function Hero() {
	return (
		<div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--color-bg-elevated)] via-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-center space-y-4 shadow-2xl">
			<div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--color-interactive-primary)]/15 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

			<div className="relative z-10 space-y-4 max-w-xl mx-auto flex flex-col items-center">
				<img
					src="/logo.png"
					alt="AMHUB Logo"
					width={80}
					height={80}
					className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl shadow-2xl border-2 border-[var(--color-border-subtle)] shrink-0"
					style={{ width: "100%", height: "100%", maxWidth: 96, maxHeight: 96 }}
				/>


				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20 text-xs font-bold uppercase tracking-wider">
					<Sparkles className="w-3.5 h-3.5" />
					<span>AMHUB v1.0 Release</span>
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
