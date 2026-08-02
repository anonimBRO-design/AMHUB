"use client";

import type { PresetCardPreset } from "@presethub/ui";
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
		<div className="md:hidden pb-32">
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
					{user.isVerified && (
						<div className="absolute bottom-0 right-0 w-7 h-7 bg-interactive-primary rounded-full flex items-center justify-center border-2 border-surface">
							<ShieldCheck className="w-4 h-4 text-white" />
						</div>
					)}
				</div>

				{/* USER INFO */}
				<div className="text-center mt-3">
					<h1 className="text-2xl font-black text-primary flex items-center justify-center gap-1">
						{user.displayName}
					</h1>
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
					<div className="grid grid-cols-2 gap-2">
						{presets.map((preset) => (
							<div
								key={preset.id}
								className="rounded-2xl overflow-hidden bg-surface flex flex-col border border-[var(--color-border-subtle)] shadow-sm"
							>
								<img
									src={preset.thumbnailUrl || "/placeholder-preset.jpg"}
									alt={preset.title}
									className="aspect-[3/4] object-cover w-full bg-base"
								/>
								<div className="p-3">
									<h3 className="text-sm font-bold text-primary line-clamp-2">
										{preset.title}
									</h3>
								</div>
							</div>
						))}
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
