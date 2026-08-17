"use client";

import { Badge, type PresetCardPreset } from "@presethub/ui";
import { Share, ShieldCheck, UserPlus } from "lucide-react";
import React, { useState } from "react";

interface MobileProfileViewProps {
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		bio?: string;
		isVerified?: boolean;
		level?: string;
		presetsCount?: number;
		followersCount?: number;
		followingCount?: number;
		totalDownloads?: number;
		totalLikes?: number;
	};
	presets: PresetCardPreset[];
}

export function MobileProfileView({ user, presets }: MobileProfileViewProps) {
	const [activeTab, setActiveTab] = useState<"presets" | "about">("presets");

	return (
		<div className="md:hidden pb-32 w-full max-w-full overflow-hidden">
			{/* COVER */}
			<div className="h-36 w-full bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-900" />

			{/* HEADER INFO */}
			<div className="px-4">
				{/* AVATAR */}
				<div className="relative w-24 h-24 mx-auto -mt-12">
					<img
						src={user.avatarUrl || "/placeholder-avatar.jpg"}
						alt={user.displayName}
						className="w-full h-full rounded-full border-4 border-surface shadow-2xl object-cover bg-base"
					/>
				</div>

				{/* USER INFO */}
				<div className="text-center mt-3 space-y-1">
					<div className="flex items-center justify-center gap-2 flex-wrap">
						<h1 className="text-2xl font-black text-primary">
							{user.displayName}
						</h1>
						{user.isVerified && (
							<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-interactive-primary/10 text-interactive-primary border border-interactive-primary/20">
								<ShieldCheck className="w-3 h-3" />
								<span>Verified Creator</span>
							</span>
						)}
					</div>
					<p className="text-[15px] text-tertiary font-medium">
						@{user.username}
					</p>

					{user.bio && (
						<p className="text-[15px] text-secondary max-w-sm mx-auto mt-2 text-center">
							{user.bio}
						</p>
					)}
				</div>
			</div>

			{/* STATS ROW */}
			<div className="flex items-center justify-between py-4 border-y border-[var(--color-border-subtle)] mt-5 px-2">
				<div className="flex-1 text-center">
					<div className="text-xl font-black text-primary">
						{user.presetsCount || 0}
					</div>
					<div className="text-[13px] text-tertiary uppercase font-semibold tracking-wider">
						Presets
					</div>
				</div>
				<div className="flex-1 text-center">
					<div className="text-xl font-black text-primary">
						{user.followersCount || 0}
					</div>
					<div className="text-[13px] text-tertiary uppercase font-semibold tracking-wider">
						Followers
					</div>
				</div>
				<div className="flex-1 text-center">
					<div className="text-xl font-black text-primary">
						{user.totalDownloads || 0}
					</div>
					<div className="text-[13px] text-tertiary uppercase font-semibold tracking-wider">
						Downloads
					</div>
				</div>
				<div className="flex-1 text-center">
					<div className="text-xl font-black text-primary">
						{user.totalLikes || 0}
					</div>
					<div className="text-[13px] text-tertiary uppercase font-semibold tracking-wider">
						Likes
					</div>
				</div>
			</div>

			{/* ACTION BUTTONS */}
			<div className="flex gap-3 px-4 mt-4">
				<button
					type="button"
					className="flex-1 min-h-[52px] rounded-2xl bg-interactive-primary text-white text-[15px] font-bold flex items-center justify-center gap-2"
				>
					<UserPlus className="w-5 h-5" />
					Follow
				</button>
				<button
					type="button"
					className="min-h-[52px] min-w-[52px] rounded-2xl bg-base border border-[var(--color-border-subtle)] flex items-center justify-center text-primary"
				>
					<Share className="w-5 h-5" />
				</button>
			</div>

			{/* TAB SWITCHER */}
			<div className="sticky top-0 bg-base z-10 flex border-b border-[var(--color-border-subtle)] mt-6">
				<button
					type="button"
					onClick={() => setActiveTab("presets")}
					className={`flex-1 py-4 text-center text-[15px] font-bold ${
						activeTab === "presets"
							? "border-b-2 border-interactive-primary text-interactive-primary"
							: "text-secondary"
					}`}
				>
					Presets
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("about")}
					className={`flex-1 py-4 text-center text-[15px] font-bold ${
						activeTab === "about"
							? "border-b-2 border-interactive-primary text-interactive-primary"
							: "text-secondary"
					}`}
				>
					About
				</button>
			</div>

			{/* TAB CONTENT */}
			<div className="mt-4 px-4">
				{activeTab === "presets" ? (
					<div className="grid grid-cols-2 gap-3">
						{presets.map((preset) => {
							const hasVideo = Boolean(
								preset.previewVideoUrl && preset.previewVideoUrl.trim(),
							);
							const hasThumb = Boolean(
								preset.thumbnailUrl && preset.thumbnailUrl.trim(),
							);
							const PRESET_PLACEHOLDER_SVG =
								"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'><rect width='100%' height='100%' fill='%2318181b'/><path d='M270 140l80 45-80 45v-90z' fill='%23a855f7'/><text x='50%' y='78%' text-anchor='middle' fill='%23a1a1aa' font-family='sans-serif' font-size='14' font-weight='600'>ALIGHT MOTION PRESET</text></svg>";
							const ratioClass = "aspect-[9/16]";

							return (
								<a
									key={preset.id}
									href={`/preset/${preset.slug}`}
									className="rounded-2xl overflow-hidden bg-surface flex flex-col border border-[var(--color-border-subtle)] shadow-sm group"
								>
									<div
										className={`relative w-full overflow-hidden shrink-0 bg-base ${ratioClass}`}
									>
										{hasVideo ? (
											<video
												src={preset.previewVideoUrl}
												poster={
													hasThumb
														? preset.thumbnailUrl
														: PRESET_PLACEHOLDER_SVG
												}
												autoPlay
												muted
												loop
												playsInline
												className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
											/>
										) : (
											<img
												src={
													hasThumb
														? preset.thumbnailUrl
														: PRESET_PLACEHOLDER_SVG
												}
												alt={preset.title}
												className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
												loading="lazy"
												onError={(e) => {
													const target = e.currentTarget;
													if (target.src !== PRESET_PLACEHOLDER_SVG) {
														target.src = PRESET_PLACEHOLDER_SVG;
													}
												}}
											/>
										)}

										<div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1 pointer-events-none z-10">
											<Badge
												variant="fileType"
												value={preset.fileType || "XML"}
												size="sm"
											/>
											<Badge
												variant="category"
												value={preset.category}
												size="sm"
											/>
											<Badge
												variant="difficulty"
												value={preset.difficulty}
												size="sm"
											/>
										</div>
									</div>
									<div className="p-3">
										<h3 className="text-sm font-bold text-primary line-clamp-2">
											{preset.title}
										</h3>
									</div>
								</a>
							);
						})}
					</div>
				) : (
					<div className="p-5 rounded-3xl bg-surface border border-[var(--color-border-subtle)] shadow-sm">
						<h2 className="text-lg font-bold text-primary mb-3">
							About Creator
						</h2>
						{user.level && (
							<div className="inline-block px-4 py-2 bg-base rounded-xl mb-4 border border-[var(--color-border-subtle)] text-[13px] font-bold text-interactive-primary">
								Level: {user.level}
							</div>
						)}
						<p className="text-[15px] text-secondary leading-relaxed whitespace-pre-wrap">
							{user.bio || "No bio provided."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
