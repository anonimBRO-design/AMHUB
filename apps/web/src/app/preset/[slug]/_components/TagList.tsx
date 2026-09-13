import {
	Calendar,
	CheckCircle2,
	FileCode,
	Layers,
	Ratio,
	Shield,
	Smartphone,
	Sparkles,
	Tag,
} from "lucide-react";

interface TagListProps {
	preset: {
		category: string;
		difficulty?: "beginner" | "intermediate" | "advanced" | string;
		aspectRatio?: string;
		fileType?: string;
		amVersionMin?: string | null;
		amVersionMax?: string | null;
		license?: string | null;
		isPaid?: boolean;
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

	const amVersionLabel = preset.amVersionMin
		? preset.amVersionMax
			? `AM ${preset.amVersionMin} – ${preset.amVersionMax}`
			: `AM ${preset.amVersionMin}+`
		: "AM v4.0+";

	const licenseLabel =
		preset.license === "commercial"
			? "Komersial"
			: preset.isPaid
				? "Personal Use"
				: "Free Use & Edit";

	const specs = [
		{
			icon: Layers,
			label: "Kategori",
			value: preset.category,
			color: "text-cyan-400",
		},
		{
			icon: Ratio,
			label: "Rasio Layar",
			value: preset.aspectRatio || "9:16",
			color: "text-emerald-400",
		},
		{
			icon: FileCode,
			label: "Format File",
			value: (preset.fileType || "XML").toUpperCase(),
			color: "text-blue-400",
		},
		{
			icon: Sparkles,
			label: "Kesulitan",
			value: preset.difficulty || "Semua Tingkat",
			color: "text-purple-400",
		},
		{
			icon: Smartphone,
			label: "Versi AM",
			value: amVersionLabel,
			color: "text-sky-400",
		},
		{
			icon: Shield,
			label: "Lisensi",
			value: licenseLabel,
			color: preset.isPaid ? "text-amber-400" : "text-emerald-400",
		},
	];

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg flex flex-col justify-between">
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
					<Tag className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						Spesifikasi & Lisensi
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						Rincian teknis aset Alight Motion
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
				{specs.map((spec) => {
					const Icon = spec.icon;
					return (
						<div
							key={spec.label}
							className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60"
						>
							<Icon className={`w-4.5 h-4.5 ${spec.color} shrink-0`} />
							<div className="min-w-0">
								<span className="block text-sm font-bold text-[var(--color-text-primary)] capitalize truncate">
									{spec.value}
								</span>
								<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
									{spec.label}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs">
				<span className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
					<Calendar className="w-3.5 h-3.5 text-amber-400" />
					Rilis:{" "}
					<strong className="text-[var(--color-text-primary)]">
						{createdDateFormatted}
					</strong>
				</span>
				<span className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
					<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
					Status:{" "}
					<strong className="text-[var(--color-text-primary)]">
						Verified Preset
					</strong>
				</span>
			</div>
		</section>
	);
}
