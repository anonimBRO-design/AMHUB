import {
	CheckCircle,
	ExternalLink,
	FileCode,
	QrCode,
	Sparkles,
} from "lucide-react";

interface ReviewStepProps {
	title: string;
	description: string;
	category: string;
	difficulty: string;
	fileType: "xml" | "qr" | "link";
	presetFile: File | null;
	thumbnailFile: File | null;
	amLink: string;
}

export function ReviewStep({
	title,
	description,
	category,
	difficulty,
	fileType,
	presetFile,
	thumbnailFile,
	amLink,
}: ReviewStepProps) {
	const thumbnailPreviewUrl = thumbnailFile
		? URL.createObjectURL(thumbnailFile)
		: null;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<Sparkles className="w-5 h-5 text-[var(--color-interactive-primary)]" />
				<h3 className="text-base font-bold text-[var(--color-text-primary)]">
					Review Your Preset Before Publishing
				</h3>
			</div>

			{/* Review Card */}
			<div className="p-5 rounded-3xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-4 shadow-xl">
				{/* Thumbnail Preview */}
				{thumbnailPreviewUrl && (
					<div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
						<img
							src={thumbnailPreviewUrl}
							alt={title}
							className="w-full h-full object-cover"
						/>
						<div className="absolute top-3 left-3 flex gap-2">
							<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
								{fileType.toUpperCase()}
							</span>
							<span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white">
								{category}
							</span>
						</div>
					</div>
				)}

				{/* Title & Description */}
				<div className="space-y-1">
					<h4 className="text-lg font-extrabold text-[var(--color-text-primary)]">
						{title}
					</h4>
					<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
						{description || "No description provided."}
					</p>
				</div>

				{/* Spec Badges Grid */}
				<div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[var(--color-border-subtle)]/60">
					<div className="p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-1">
						<span className="text-[var(--color-text-tertiary)] block text-[10px] font-bold uppercase">
							Category
						</span>
						<span className="font-bold text-[var(--color-text-primary)] capitalize">
							{category}
						</span>
					</div>

					<div className="p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-1">
						<span className="text-[var(--color-text-tertiary)] block text-[10px] font-bold uppercase">
							Difficulty
						</span>
						<span className="font-bold text-[var(--color-text-primary)] capitalize">
							{difficulty}
						</span>
					</div>

					<div className="col-span-2 p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-between">
						<div className="flex items-center gap-2">
							{fileType === "xml" && (
								<FileCode className="w-4 h-4 text-blue-400" />
							)}
							{fileType === "qr" && (
								<QrCode className="w-4 h-4 text-purple-400" />
							)}
							{fileType === "link" && (
								<ExternalLink className="w-4 h-4 text-emerald-400" />
							)}
							<span className="font-semibold text-[var(--color-text-primary)]">
								{fileType === "link"
									? "Alight Motion Import Link"
									: `${fileType.toUpperCase()} Preset File`}
							</span>
						</div>
						<span className="text-xs font-mono text-[var(--color-text-tertiary)] truncate max-w-[150px]">
							{fileType === "link" ? amLink : presetFile?.name}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
