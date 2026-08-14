import {
	ExternalLink,
	FileCode,
	Film,
	HardDrive,
	Sparkles,
} from "lucide-react";
import type { PresetSourceType } from "@/lib/validation/types";
import { useEffect } from "react";

interface ReviewStepProps {
	title: string;
	description: string;
	category: string;
	difficulty: string;
	fileType: "xml" | "gdrive" | "link";
	presetFile: File | null;
	thumbnailFile: File | null;
	amLink: string;
	gdriveLink?: string;
	previewVideoFile?: File | null;
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
	gdriveLink,
	previewVideoFile,
	amLinkSourceType,
}: ReviewStepProps) {
	const thumbnailPreviewUrl = thumbnailFile
		? URL.createObjectURL(thumbnailFile)
		: null;

	const videoPreviewUrl = previewVideoFile
		? URL.createObjectURL(previewVideoFile)
		: null;

	useEffect(() => {
		return () => {
			if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
			if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
		};
	}, [thumbnailPreviewUrl, videoPreviewUrl]);

	// Format Source Type
	let displaySourceType = "XML FILE";
	let displayIcon = <FileCode className="w-4 h-4 text-blue-400" />;
	let sourceName = presetFile?.name || "XML File";

	if (fileType === "gdrive") {
		displaySourceType = "GOOGLE DRIVE (XML)";
		displayIcon = <HardDrive className="w-4 h-4 text-amber-400" />;
		sourceName = gdriveLink || "Google Drive Link";
	} else if (fileType === "link") {
		sourceName = amLink;
		displaySourceType = "ALIGHT CREATIVE";
		displayIcon = <ExternalLink className="w-4 h-4 text-emerald-400" />;
	}

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

				{/* Thumbnail or Video Preview */}
				<div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] group">
					{videoPreviewUrl ? (
						<video
							src={videoPreviewUrl}
							poster={thumbnailPreviewUrl ?? undefined}
							className="w-full h-full object-contain bg-black"
							controls
						/>
					) : thumbnailPreviewUrl ? (
						<img
							src={thumbnailPreviewUrl}
							alt={title}
							className="w-full h-full object-cover"
						/>
					) : null}

					{/* Top Left Badges */}
					<div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
						<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
							{displaySourceType}
						</span>
						<span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white">
							{category}
						</span>
					</div>

					{/* File Info Badges (Bottom Right) */}
					<div className="absolute bottom-3 right-3 flex gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
						{previewVideoFile && (
							<span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
								<Film className="w-3 h-3" /> VIDEO
							</span>
						)}
					</div>
				</div>

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
							{displayIcon}
							<span className="font-semibold text-[var(--color-text-primary)]">
								{fileType === "link" || fileType === "gdrive"
									? displaySourceType
									: "XML Preset File"}
							</span>
						</div>
						{fileType === "link" ? (
							<a
								href={amLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-interactive-primary)] truncate max-w-[150px] transition-colors"
								title={amLink}
							>
								{sourceName}
							</a>
						) : fileType === "gdrive" ? (
							<a
								href={gdriveLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-interactive-primary)] truncate max-w-[150px] transition-colors"
								title={gdriveLink}
							>
								{sourceName}
							</a>
						) : (
							<span className="text-xs font-mono text-[var(--color-text-tertiary)] truncate max-w-[150px]" title={presetFile?.name}>
								{sourceName}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
