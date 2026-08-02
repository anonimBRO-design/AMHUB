"use client";

import { Check, Image, Sparkles, Upload } from "lucide-react";
import { type ChangeEvent, useState } from "react";

interface ThumbnailStepProps {
	thumbnailFile: File | null;
	onThumbnailFileChange: (file: File | null) => void;
}

export function ThumbnailStep({
	thumbnailFile,
	onThumbnailFileChange,
}: ThumbnailStepProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		thumbnailFile ? URL.createObjectURL(thumbnailFile) : null,
	);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			onThumbnailFileChange(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files?.[0]) {
			const file = e.dataTransfer.files[0];
			onThumbnailFileChange(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h3 className="text-base font-bold text-[var(--color-text-primary)]">
					Upload Thumbnail Cover Image
				</h3>
				<p className="text-xs text-[var(--color-text-secondary)]">
					Add a high-quality preview cover image for your preset.
				</p>
			</div>

			{/* Drop Zone with Live Image Preview */}
			<div
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
				className={`relative flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-2 border-dashed overflow-hidden transition-all text-center ${
					isDragging
						? "border-[var(--color-interactive-primary)] bg-[var(--color-interactive-primary)]/5"
						: previewUrl
							? "border-emerald-500/50 bg-[var(--color-bg-base)]"
							: "border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:border-[var(--color-border-strong)]"
				}`}
			>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={handleFileSelect}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
				/>

				{previewUrl ? (
					<div className="relative w-full h-full min-h-[220px]">
						<img
							src={previewUrl}
							alt="Thumbnail preview"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
							<Upload className="w-6 h-6" />
							<span className="text-xs font-bold">Tap to Change Thumbnail</span>
						</div>
						<div className="absolute top-3 right-3 p-1.5 rounded-full bg-emerald-500 text-white shadow-lg z-10">
							<Check className="w-4 h-4" />
						</div>
					</div>
				) : (
					<div className="space-y-3 p-6">
						<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] w-fit mx-auto border border-[var(--color-border-subtle)]">
							<Image className="w-8 h-8 text-purple-400" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-bold text-[var(--color-text-primary)]">
								Tap or drag cover image
							</p>
							<p className="text-xs text-[var(--color-text-tertiary)]">
								PNG, JPG or WebP (16:9 ratio recommended)
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
