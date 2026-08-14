"use client";

import { useAuth } from "@/context/AuthContext";
import type { PresetCardPreset } from "@presethub/ui";
import {
	BadgeCheck,
	Bookmark,
	Download,
	Eye,
	HardDrive,
	Heart,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { CommentSection } from "./CommentSection";

interface MobilePresetViewProps {
	preset: PresetCardPreset & {
		fileSize?: string;
		downloadUrl?: string;
		comments?: unknown[];
	};
}

export function MobilePresetView({ preset }: MobilePresetViewProps) {
	const [isLiked, setIsLiked] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const { requireAuth } = useAuth();

	const handleLike = () => {
		if (requireAuth(undefined, "Sign in to like presets")) {
			setIsLiked(!isLiked);
		}
	};
	const handleSave = () => {
		if (requireAuth(undefined, "Sign in to bookmark presets")) {
			setIsSaved(!isSaved);
		}
	};

	const ratioClass = "aspect-[9/16]";

	return (
		<div className="md:hidden space-y-6 pb-32 w-full max-w-full overflow-hidden">
			{/* PREVIEW CONTAINER */}
			<div
				className={`-mx-4 relative w-full rounded-3xl overflow-hidden bg-base shrink-0 ${ratioClass}`}
			>
				<Image
					src={preset.thumbnailUrl || "/placeholder.png"}
					alt={preset.title}
					fill
					className="object-contain absolute inset-0 w-full h-full"
					sizes="100vw"
					priority
				/>

				{/* Gradients */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

				{/* Top Badges */}
				<div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
					<span className="bg-black/60 backdrop-blur rounded-full text-sm font-semibold text-white px-3 py-1.5">
						{preset.category}
					</span>
				</div>

				{/* Bottom Overlay Content */}
				<div className="absolute bottom-0 left-0 right-0 p-5 pt-12 text-white pointer-events-none">
					<div className="flex items-center gap-3 mb-4 pointer-events-auto cursor-pointer">
						<div className="relative w-12 h-12 rounded-full ring-2 ring-purple-500 overflow-hidden bg-black/20">
							{preset.creator?.avatarUrl ? (
								<Image
									src={preset.creator.avatarUrl}
									alt={preset.creator.displayName}
									fill
									sizes="48px"
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-interactive-primary text-white font-bold text-lg">
									{preset.creator?.displayName?.[0]?.toUpperCase() || "U"}
								</div>
							)}
						</div>
						<div className="flex flex-col">
							<span className="text-[15px] font-bold text-white flex items-center gap-1">
								{preset.creator.displayName}
								{preset.creator.isVerified && (
									<BadgeCheck className="w-4 h-4 text-interactive-primary" />
								)}
							</span>
							<span className="text-sm text-white/70">
								@{preset.creator.username}
							</span>
						</div>
					</div>
					<h1 className="text-2xl font-black text-white leading-tight mb-1">
						{preset.title}
					</h1>
					<p className="text-[15px] text-white/80 line-clamp-2">
						{preset.description}
					</p>
				</div>
			</div>

			{/* STATS & DOWNLOAD CARD */}
			<div className="rounded-3xl bg-surface border border-[var(--color-border-subtle)] p-5 shadow-xl mx-4">
				<div className="grid grid-cols-2 gap-3 mb-5">
					<div className="p-4 rounded-2xl bg-base flex flex-col justify-center items-center">
						<div className="flex items-center gap-1.5 text-tertiary mb-1">
							<Download className="w-4 h-4" />
							<span className="text-[13px] font-medium">Downloads</span>
						</div>
						<span className="text-xl font-black text-primary">
							{preset.downloadCount?.toLocaleString() || "0"}
						</span>
					</div>
					<div className="p-4 rounded-2xl bg-base flex flex-col justify-center items-center">
						<div className="flex items-center gap-1.5 text-tertiary mb-1">
							<Eye className="w-4 h-4" />
							<span className="text-[13px] font-medium">Views</span>
						</div>
						<span className="text-xl font-black text-primary">
							{preset.viewCount?.toLocaleString() || "0"}
						</span>
					</div>
					<div className="p-4 rounded-2xl bg-base flex flex-col justify-center items-center">
						<div className="flex items-center gap-1.5 text-tertiary mb-1">
							<HardDrive className="w-4 h-4" />
							<span className="text-[13px] font-medium">File Size</span>
						</div>
						<span className="text-xl font-black text-primary">
							{preset.fileSize || "N/A"}
						</span>
					</div>
					<div className="p-4 rounded-2xl bg-base flex flex-col justify-center items-center">
						<div className="flex items-center gap-1.5 text-tertiary mb-1">
							<span className="text-[13px] font-medium">Difficulty</span>
						</div>
						<span className="text-xl font-black text-primary capitalize">
							{preset.difficulty || "Easy"}
						</span>
					</div>
				</div>

				<button
					type="button"
					className="min-h-[56px] w-full rounded-2xl bg-interactive-primary text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
				>
					<Download className="w-6 h-6" />
					Download Preset
				</button>
			</div>

			{/* COMMENT SECTION */}
			<div className="px-4">
				<CommentSection
					presetId={preset.id}
					commentCount={preset.commentCount}
				/>
			</div>

			{/* BOTTOM ACTION BAR */}
			<div className="mt-6 mx-4 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 shadow-xl">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleLike}
						className={`flex-1 min-h-[52px] rounded-2xl flex items-center justify-center gap-2 border border-[var(--color-border-subtle)] bg-base transition-colors ${isLiked ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-primary"}`}
					>
						<Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
					</button>

					<button
						type="button"
						onClick={handleSave}
						className={`flex-1 min-h-[52px] rounded-2xl flex items-center justify-center gap-2 border border-[var(--color-border-subtle)] bg-base transition-colors ${isSaved ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-primary"}`}
					>
						<Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
					</button>

					<button
						type="button"
						className="flex-[2] min-h-[52px] rounded-2xl bg-interactive-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
					>
						<Download className="w-5 h-5" />
						Download
					</button>
				</div>
			</div>
		</div>
	);
}
