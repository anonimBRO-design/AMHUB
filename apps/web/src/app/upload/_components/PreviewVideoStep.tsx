"use client";

import { Check, Film, Pause, Play, Upload, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

interface PreviewVideoStepProps {
	previewVideoFile: File | null;
	onPreviewVideoFileChange: (file: File | null) => void;
}

export function PreviewVideoStep({
	previewVideoFile,
	onPreviewVideoFileChange,
}: PreviewVideoStepProps) {
	const [videoPreviewUrl, setVideoVideoPreviewUrl] = useState<string | null>(
		previewVideoFile ? URL.createObjectURL(previewVideoFile) : null,
	);
	const [isDragging, setIsDragging] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			onPreviewVideoFileChange(file);
			if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
			setVideoVideoPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files?.[0]) {
			const file = e.dataTransfer.files[0];
			onPreviewVideoFileChange(file);
			if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
			setVideoVideoPreviewUrl(URL.createObjectURL(file));
		}
	};

	const removeVideo = () => {
		onPreviewVideoFileChange(null);
		if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
		setVideoVideoPreviewUrl(null);
		setIsPlaying(false);
	};

	const togglePlay = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h3 className="text-base font-bold text-[var(--color-text-primary)]">
					Upload Preview Video (Optional)
				</h3>
				<p className="text-xs text-[var(--color-text-secondary)]">
					Add a short demo video of your Alight Motion preset.
				</p>
			</div>

			{videoPreviewUrl ? (
				<div className="relative group rounded-3xl border border-[var(--color-border-subtle)] bg-black overflow-hidden aspect-[9/16] max-w-sm mx-auto shadow-2xl">
					<video
						ref={videoRef}
						src={videoPreviewUrl}
						className="w-full h-full object-contain"
						onPlay={() => setIsPlaying(true)}
						onPause={() => setIsPlaying(false)}
						onClick={togglePlay}
					/>

					{/* Custom Controls Overlay */}
					<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
						<button
							onClick={togglePlay}
							className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:scale-110 active:scale-95 transition-all"
						>
							{isPlaying ? (
								<Pause className="w-8 h-8 fill-current" />
							) : (
								<Play className="w-8 h-8 fill-current ml-1" />
							)}
						</button>
					</div>

					<button
						type="button"
						onClick={removeVideo}
						className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-rose-500 transition-colors z-30"
					>
						<X className="w-4 h-4" />
					</button>

					<div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider z-30">
						{previewVideoFile?.name.split(".").pop()?.toUpperCase()} •{" "}
						{(previewVideoFile?.size
							? previewVideoFile.size / (1024 * 1024)
							: 0
						).toFixed(1)}{" "}
						MB
					</div>
				</div>
			) : (
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					className={`relative flex flex-col items-center justify-center min-h-[200px] rounded-3xl border-2 border-dashed transition-all text-center ${
						isDragging
							? "border-[var(--color-interactive-primary)] bg-[var(--color-interactive-primary)]/5"
							: "border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:border-[var(--color-border-strong)]"
					}`}
				>
					<input
						type="file"
						accept="video/mp4,video/webm"
						onChange={handleFileSelect}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
					/>

					<div className="space-y-3 p-6">
						<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] w-fit mx-auto border border-[var(--color-border-subtle)]">
							<Film className="w-8 h-8 text-sky-400" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-bold text-[var(--color-text-primary)]">
								Tap or drag preview video
							</p>
							<p className="text-xs text-[var(--color-text-tertiary)]">
								MP4 or WebM (Max 50MB)
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
