import { useLanguage } from "@/i18n";
import { formatCategory } from "@/lib/format-category";
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
	const { t, language } = useLanguage();

	const createdDateFormatted = preset.createdAt
		? new Date(preset.createdAt).toLocaleDateString(
				language === "id" ? "id-ID" : "en-US",
				{
					month: "short",
					day: "numeric",
					year: "numeric",
				},
			)
		: language === "id"
			? "Baru saja"
			: "Just now";

	const amVersionLabel = preset.amVersionMin
		? preset.amVersionMax
			? `AM ${preset.amVersionMin} – ${preset.amVersionMax}`
			: `AM ${preset.amVersionMin}+`
		: "AM v4.0+";

	const licenseLabel =
		preset.license === "commercial"
			? t.presetDetail.licenseCommercial
			: preset.isPaid
				? t.presetDetail.licensePersonal
				: t.presetDetail.licenseFree;

	const difficultyMap: Record<string, string> = {
		beginner: language === "id" ? "Pemula" : "Beginner",
		intermediate: language === "id" ? "Menengah" : "Intermediate",
		advanced: language === "id" ? "Mahir" : "Advanced",
	};
	const difficultyLabel =
		(preset.difficulty && difficultyMap[preset.difficulty.toLowerCase()]) ||
		t.presetDetail.allLevels;

	const specs = [
		{
			icon: Layers,
			label: t.presetDetail.category,
			value: formatCategory(preset.category),
			color: "text-cyan-400",
		},
		{
			icon: Ratio,
			label: t.presetDetail.aspectRatio,
			value: preset.aspectRatio || "9:16",
			color: "text-emerald-400",
		},
		{
			icon: FileCode,
			label: t.presetDetail.fileFormat,
			value: (preset.fileType || "XML").toUpperCase(),
			color: "text-blue-400",
		},
		{
			icon: Sparkles,
			label: t.presetDetail.difficulty,
			value: difficultyLabel,
			color: "text-purple-400",
		},
		{
			icon: Smartphone,
			label: t.presetDetail.amVersion,
			value: amVersionLabel,
			color: "text-sky-400",
		},
		{
			icon: Shield,
			label: t.presetDetail.license,
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
						{t.presetDetail.specsTitle}
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						{t.presetDetail.specsSubtitle}
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
								<span className="block text-sm font-bold text-[var(--color-text-primary)] truncate">
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
					{t.presetDetail.released}{" "}
					<strong className="text-[var(--color-text-primary)]">
						{createdDateFormatted}
					</strong>
				</span>
				<span className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
					<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
					Status:{" "}
					<strong className="text-[var(--color-text-primary)]">
						{t.presetDetail.verifiedByAmhub}
					</strong>
				</span>
			</div>
		</section>
	);
}
