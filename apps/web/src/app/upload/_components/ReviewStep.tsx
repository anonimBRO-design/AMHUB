import type { PresetSourceFormat } from "@/lib/validation/types";
import {
	Banknote,
	ExternalLink,
	FileCode,
	Film,
	Gift,
	HardDrive,
	Sparkles,
} from "lucide-react";
import { useEffect } from "react";

interface ReviewStepProps {
	title: string;
	description: string;
	category: string;
	difficulty: string;
	selectedFileTypes: PresetSourceFormat[];
	presetFile: File | null;
	thumbnailFile?: File | null;
	amLink: string;
	gdriveLink?: string;
	previewVideoFile?: File | null;
	isPaid?: boolean;
	price?: number;
}

export function ReviewStep({
	title,
	description,
	category,
	difficulty,
	selectedFileTypes,
	presetFile,
	thumbnailFile = null,
	amLink,
	gdriveLink,
	previewVideoFile,
	isPaid = false,
	price = 0,
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

	const qrisFee = Math.max(0, Math.round(price * 0.007));
	const netAmount = Math.max(0, price - qrisFee);
	const creatorEarnings = Math.round(netAmount * 0.9);

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
				<div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] group flex items-center justify-center">
					{videoPreviewUrl ? (
						<video
							src={videoPreviewUrl}
							className="absolute inset-0 w-full h-full object-contain"
							controls
						/>
					) : thumbnailPreviewUrl ? (
						<img
							src={thumbnailPreviewUrl}
							alt={title}
							className="absolute inset-0 w-full h-full object-contain"
						/>
					) : (
						<div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-[var(--color-text-secondary)]">
							<Film className="w-10 h-10 stroke-[1.5] text-cyan-400/60" />
							<span className="text-xs font-semibold">
								No video preview (Default cover will be used)
							</span>
						</div>
					)}

					{/* Top Left Badges */}
					<div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
						{selectedFileTypes.includes("xml") && (
							<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/80 backdrop-blur-md text-white border border-blue-400/20">
								XML FILE
							</span>
						)}
						{selectedFileTypes.includes("link") && (
							<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/80 backdrop-blur-md text-white border border-emerald-400/20">
								AM LINK
							</span>
						)}
						{selectedFileTypes.includes("gdrive") && (
							<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600/80 backdrop-blur-md text-white border border-amber-400/20">
								GOOGLE DRIVE (XML)
							</span>
						)}
						<span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white">
							{category}
						</span>
						{isPaid && price > 0 ? (
							<span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-amber-500 text-amber-950 shadow-md">
								Rp {price.toLocaleString("id-ID")}
							</span>
						) : (
							<span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-emerald-500/90 text-white">
								GRATIS
							</span>
						)}
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
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-[var(--color-border-subtle)]/60">
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

					<div className="p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-1 col-span-2 sm:col-span-1">
						<span className="text-[var(--color-text-tertiary)] block text-[10px] font-bold uppercase">
							Pricing
						</span>
						{isPaid && price > 0 ? (
							<div>
								<span className="font-extrabold text-amber-400">
									Rp {price.toLocaleString("id-ID")}
								</span>
								<span className="block text-[10px] text-emerald-400 font-semibold">
									Net: +Rp {creatorEarnings.toLocaleString("id-ID")}
								</span>
							</div>
						) : (
							<span className="font-bold text-emerald-400">Gratis (Free)</span>
						)}
					</div>

					{/* Selected Sources List */}
					<div className="col-span-2 sm:col-span-3 space-y-2 p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
						<span className="text-[var(--color-text-tertiary)] block text-[10px] font-bold uppercase">
							Attached Preset Sources ({selectedFileTypes.length})
						</span>

						<div className="space-y-1.5">
							{selectedFileTypes.includes("xml") && (
								<div className="flex items-center justify-between text-xs">
									<div className="flex items-center gap-2 text-blue-400 font-semibold">
										<FileCode className="w-4 h-4" />
										<span>XML File</span>
									</div>
									<span className="font-mono text-[11px] text-[var(--color-text-tertiary)] truncate max-w-[180px]">
										{presetFile?.name || "XML file attached"}
									</span>
								</div>
							)}

							{selectedFileTypes.includes("link") && (
								<div className="flex items-center justify-between text-xs">
									<div className="flex items-center gap-2 text-emerald-400 font-semibold">
										<ExternalLink className="w-4 h-4" />
										<span>AM Link</span>
									</div>
									<span className="font-mono text-[11px] text-[var(--color-text-tertiary)] truncate max-w-[180px]">
										{amLink || "Alight Creative Link"}
									</span>
								</div>
							)}

							{selectedFileTypes.includes("gdrive") && (
								<div className="flex items-center justify-between text-xs">
									<div className="flex items-center gap-2 text-amber-400 font-semibold">
										<HardDrive className="w-4 h-4" />
										<span>Google Drive (XML)</span>
									</div>
									<span className="font-mono text-[11px] text-[var(--color-text-tertiary)] truncate max-w-[180px]">
										{gdriveLink || "Google Drive Link"}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
