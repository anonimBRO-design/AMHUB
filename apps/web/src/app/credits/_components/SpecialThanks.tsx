import { Globe, Heart } from "lucide-react";

export function SpecialThanks() {
	return (
		<div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-xl text-center sm:text-left relative overflow-hidden">
			<div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
				<Heart className="w-4 h-4 fill-current" />
				<span>Special Thanks & Open Source</span>
			</div>

			<div className="space-y-2 max-w-2xl">
				<h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
					Grateful for the Alight Motion Community
				</h3>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					Special thanks to everyone who tested, shared feedback, created XML &
					QR presets, and helped improve AMHUB throughout development. Huge
					gratitude to the open-source software community whose libraries made
					this platform possible.
				</p>
			</div>
		</div>
	);
}
