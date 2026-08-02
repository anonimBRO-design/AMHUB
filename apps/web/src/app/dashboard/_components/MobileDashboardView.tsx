"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { Activity, UploadCloud, Users } from "lucide-react";
import Image from "next/image";
import React from "react";

interface MobileDashboardViewProps {
	user: {
		displayName: string;
		username: string;
		level?: number;
	};
	userPresets: PresetCardPreset[];
}

export function MobileDashboardView({
	user,
	userPresets,
}: MobileDashboardViewProps) {
	return (
		<div className="md:hidden space-y-8 pb-32">
			{/* Creator Studio Header */}
			<div className="-mx-4 bg-gradient-to-br from-violet-600 to-purple-900 p-6 shadow-xl">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h1 className="text-2xl font-black text-white">
							{user.displayName}
						</h1>
						<p className="text-[15px] text-purple-200">@{user.username}</p>
					</div>
					{user.level !== undefined && (
						<span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-md">
							Lvl {user.level}
						</span>
					)}
				</div>

				<button
					type="button"
					className="mt-6 w-full min-h-[56px] rounded-2xl bg-white text-[15px] font-bold text-purple-700 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
				>
					<UploadCloud className="w-6 h-6" />
					Upload New Preset
				</button>
			</div>

			<div className="px-4 space-y-8">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-2xl border border-[var(--color-border-subtle)] bg-surface p-5 shadow-sm">
						<Activity className="w-6 h-6 text-violet-500 mb-2" />
						<p className="text-[13px] font-semibold uppercase tracking-wider text-tertiary">
							Total Views
						</p>
						<p className="mt-1 text-2xl font-black">24.5k</p>
					</div>
					<div className="rounded-2xl border border-[var(--color-border-subtle)] bg-surface p-5 shadow-sm">
						<Users className="w-6 h-6 text-purple-500 mb-2" />
						<p className="text-[13px] font-semibold uppercase tracking-wider text-tertiary">
							Followers
						</p>
						<p className="mt-1 text-2xl font-black">1,248</p>
					</div>
				</div>

				{/* My Presets */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold">My Presets</h2>
						<button
							type="button"
							className="text-[15px] font-bold text-interactive-primary"
						>
							See All
						</button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						{userPresets.map((preset) => (
							<div
								key={preset.id}
								className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-surface shadow-sm"
							>
								<div className="relative aspect-[3/4] w-full bg-surface-hover">
									{preset.thumbnailUrl ? (
										<Image
											src={preset.thumbnailUrl}
											alt={preset.title}
											fill
											className="object-cover"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center">
											<span className="text-tertiary text-[13px]">
												No Preview
											</span>
										</div>
									)}
								</div>
								<div className="p-3">
									<h3 className="line-clamp-1 text-sm font-bold">
										{preset.title}
									</h3>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
