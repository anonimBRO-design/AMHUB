"use client";

import { resolveStorageUrl } from "@/lib/supabase/storage";
import { GitFork, History } from "lucide-react";
import Link from "next/link";

export interface RemixNodeData {
	id: string;
	slug: string;
	title: string;
	thumbnail_url: string;
	creator: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
	};
}

interface RemixCardProps {
	parent: RemixNodeData | null;
	remixes: RemixNodeData[];
	totalChildren: number;
}

export function RemixCard({ parent, remixes, totalChildren }: RemixCardProps) {
	if (!parent && remixes.length === 0) return null;

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
					<GitFork className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						Riwayat Remix
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						Atribusi otomatis ke kreator asli
					</p>
				</div>
			</div>

			{parent && (
				<Link
					href={`/preset/${parent.slug}`}
					className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 hover:border-[var(--color-border-strong)] transition-all group"
				>
					<div className="w-14 h-14 rounded-lg overflow-hidden bg-black shrink-0">
						{(resolveStorageUrl(parent.thumbnail_url) ??
							parent.thumbnail_url) && (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={
									resolveStorageUrl(parent.thumbnail_url) ??
									parent.thumbnail_url
								}
								alt={parent.title}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						)}
					</div>
					<div className="min-w-0">
						<p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-1">
							<History className="w-3 h-3" />
							Remix dari
						</p>
						<p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] truncate transition-colors">
							{parent.title}
						</p>
						<p className="text-[11px] text-[var(--color-text-secondary)] truncate">
							@{parent.creator.username}
						</p>
					</div>
				</Link>
			)}

			{remixes.length > 0 && (
				<div className="space-y-2.5">
					<p className="text-xs font-bold text-[var(--color-text-secondary)]">
						Diremix {totalChildren} kali
					</p>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
						{remixes.map((child) => (
							<Link
								key={child.id}
								href={`/preset/${child.slug}`}
								className="group rounded-xl overflow-hidden bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 hover:border-[var(--color-border-strong)] transition-all"
							>
								<div className="aspect-video bg-black overflow-hidden">
									{(resolveStorageUrl(child.thumbnail_url) ??
										child.thumbnail_url) && (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={
												resolveStorageUrl(child.thumbnail_url) ??
												child.thumbnail_url
											}
											alt={child.title}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform"
											loading="lazy"
										/>
									)}
								</div>
								<div className="p-2">
									<p className="text-[11px] font-bold text-[var(--color-text-primary)] truncate">
										{child.title}
									</p>
									<p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
										@{child.creator.username}
									</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</section>
	);
}
