import { Code, Paintbrush, Rocket, ShieldCheck } from "lucide-react";

export function CreatorCard() {
	return (
		<div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-xl relative overflow-hidden">
			<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
				<Rocket className="w-4 h-4" />
				<span>Project Creator</span>
			</div>

			<div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
				<img
					src="/anonimbro-avatar.jpeg"
					alt="AnonimBRO"
					className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[var(--color-interactive-primary)]/40 shadow-xl shrink-0"
				/>

				<div className="space-y-2 flex-1">
					<div className="flex items-center justify-center sm:justify-start gap-2">
						<h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)]">
							AnonimBRO
						</h2>
						<ShieldCheck className="w-5 h-5 text-[var(--color-interactive-primary)]" />
					</div>

					<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
						Founder, lead architect, developer, and UI/UX designer behind AMHUB.
						Dedicated to building high-performance mobile-first software for
						creators.
					</p>

					<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
						<span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
							<Rocket className="w-3.5 h-3.5" /> Founder
						</span>
						<span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
							<Code className="w-3.5 h-3.5" /> Developer
						</span>
						<span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
							<Paintbrush className="w-3.5 h-3.5" /> Designer
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
