"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { Heart, Search, User } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface MobileLikesViewProps {
	bookmarks: PresetCardPreset[];
}

export function MobileLikesView({ bookmarks }: MobileLikesViewProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredBookmarks = bookmarks.filter(
		(b) =>
			b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			b.creator.username.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="md:hidden space-y-8 px-4 pb-32 pt-4">
			{/* Header */}
			<div className="flex items-center gap-4">
				<div className="rounded-2xl bg-rose-500/10 p-3.5">
					<Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
				</div>
				<div>
					<h1 className="text-xl font-bold">Liked Presets</h1>
					<p className="text-[15px] font-medium text-tertiary">
						{bookmarks.length} items
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<Search className="h-5 w-5 text-tertiary" />
				</div>
				<input
					type="text"
					placeholder="Search in likes..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full min-h-[52px] rounded-2xl border border-[var(--color-border-subtle)] bg-surface py-3 pl-11 pr-4 text-[15px] font-medium placeholder:text-tertiary focus:border-interactive-primary focus:outline-none focus:ring-1 focus:ring-interactive-primary"
				/>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-2 gap-3">
				{filteredBookmarks.map((preset) => (
					<div key={preset.id} className="flex flex-col gap-2">
						<div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-surface-hover shadow-sm">
							{preset.thumbnailUrl ? (
								<Image
									src={preset.thumbnailUrl}
									alt={preset.title}
									fill
									className="object-cover"
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="text-tertiary text-[13px]">No Preview</span>
								</div>
							)}
						</div>
						<div className="px-1">
							<h3 className="line-clamp-1 text-sm font-bold">{preset.title}</h3>
							<div className="mt-1 flex items-center gap-1.5">
								<div className="relative h-6 w-6 overflow-hidden rounded-full bg-surface-hover border border-[var(--color-border-subtle)]">
									{preset.creator.avatarUrl ? (
										<Image
											src={preset.creator.avatarUrl}
											alt={preset.creator.username}
											fill
											className="object-cover"
										/>
									) : (
										<User className="h-full w-full p-1 text-tertiary" />
									)}
								</div>
								<span className="line-clamp-1 text-[13px] font-medium text-tertiary">
									{preset.creator.username}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{filteredBookmarks.length === 0 && (
				<div className="py-12 text-center">
					<p className="text-[15px] font-semibold text-tertiary">
						No presets found.
					</p>
				</div>
			)}
		</div>
	);
}
