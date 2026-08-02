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
		? new Date(preset.createdAt).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: "Recently added";

	return (
		<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
			<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
				<Tag className="w-4 h-4 text-[var(--color-interactive-primary)]" />
				<span>Specifications & Tags</span>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
				<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
						<Layers className="w-3.5 h-3.5" /> Category
					</span>
					<p className="font-bold text-[var(--color-text-primary)] capitalize">
						{preset.category}
					</p>
				</div>

				<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
						<Smartphone className="w-3.5 h-3.5" /> Compatibility
					</span>
					<p className="font-bold text-[var(--color-text-primary)]">
						AM v4.0+ (Android / iOS)
					</p>
				</div>

				<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
						<Shield className="w-3.5 h-3.5" /> License
					</span>
					<p className="font-bold text-emerald-400">
						Free Personal & Commercial
					</p>
				</div>

				<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-1">
					<span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
						<Calendar className="w-3.5 h-3.5" /> Published
					</span>
					<p className="font-bold text-[var(--color-text-primary)]">
						{createdDateFormatted}
					</p>
				</div>
			</div>
		</div>
	);
}
