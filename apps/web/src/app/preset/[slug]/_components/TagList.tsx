import { Calendar, Layers, Shield, Smartphone, Tag } from "lucide-react";

interface TagListProps {
	preset: {
		category: string;
		difficulty: "beginner" | "intermediate" | "advanced";
		createdAt?: string;
	};
}

export function TagList({ preset }: TagListProps) {
	const createdDateFormatted = preset.createdAt
		? new Date(preset.createdAt).toLocaleDateString("id-ID", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: "Baru saja";

	return (
		<div className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg flex flex-col justify-between">
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
					<Tag className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						Spesifikasi & Lisensi
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						Rincian teknis preset
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2.5 text-xs">
				<div className="p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1.5 text-[10px] uppercase font-semibold">
						<Layers className="w-3.5 h-3.5 text-cyan-400" /> Kategori
					</span>
					<p className="font-bold text-[var(--color-text-primary)] capitalize truncate">
						{preset.category}
					</p>
				</div>

				<div className="p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1.5 text-[10px] uppercase font-semibold">
						<Smartphone className="w-3.5 h-3.5 text-sky-400" /> Versi AM
					</span>
					<p className="font-bold text-[var(--color-text-primary)] truncate">
						AM v4.0+ (All Devices)
					</p>
				</div>

				<div className="p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1.5 text-[10px] uppercase font-semibold">
						<Shield className="w-3.5 h-3.5 text-emerald-400" /> Lisensi
					</span>
					<p className="font-bold text-emerald-400 truncate">Free Use & Edit</p>
				</div>

				<div className="p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1.5 text-[10px] uppercase font-semibold">
						<Calendar className="w-3.5 h-3.5 text-amber-400" /> Rilis
					</span>
					<p className="font-bold text-[var(--color-text-primary)] truncate">
						{createdDateFormatted}
					</p>
				</div>
			</div>
		</div>
	);
}
