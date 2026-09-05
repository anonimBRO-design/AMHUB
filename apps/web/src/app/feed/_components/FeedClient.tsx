"use client";

import { resolveStorageUrl } from "@/lib/supabase/storage";
import {
	ChevronDown,
	ChevronUp,
	Clapperboard,
	Heart,
	Volume2,
	VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface FeedItem {
	id: string;
	slug: string;
	title: string;
	previewVideoUrl: string;
	thumbnailUrl: string;
	likeCount: number;
	creatorUsername: string;
	creatorDisplayName: string;
}

export function FeedClient({ items }: { items: FeedItem[] }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
	const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
	const [muted, setMuted] = useState(true);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || items.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).dataset.feedId;
					if (!id) continue;
					const video = videoRefs.current.get(id);
					if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
						setActiveId(id);
						video?.play().catch(() => {});
					} else {
						video?.pause();
					}
				}
			},
			{ root: container, threshold: [0.6] },
		);
		const slides = container.querySelectorAll("[data-feed-id]");
		slides.forEach((s) => observer.observe(s));
		return () => observer.disconnect();
	}, [items.length]);

	useEffect(() => {
		videoRefs.current.forEach((video) => {
			video.muted = muted;
		});
	}, [muted]);

	const scrollBySlide = useCallback((dir: 1 | -1) => {
		const container = containerRef.current;
		if (!container) return;
		const slide = container.querySelector<HTMLElement>("[data-feed-id]");
		const height = slide?.clientHeight ?? container.clientHeight;
		container.scrollBy({ top: dir * height, behavior: "smooth" });
	}, []);

	if (items.length === 0) {
		return (
			<div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
				<div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
					<Clapperboard className="w-7 h-7" />
				</div>
				<h1 className="font-display text-2xl font-extrabold text-white">
					Belum ada video preview
				</h1>
				<p className="text-sm text-[var(--color-text-secondary)]">
					Upload preset dengan video preview untuk tampil di feed ini.
				</p>
				<Link
					href="/explore"
					className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-2xl bg-[var(--color-interactive-primary)] text-white text-sm font-bold"
				>
					Jelajahi Preset
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto px-4 sm:px-0">
			<div
				ref={containerRef}
				className="h-[calc(100dvh-180px)] min-h-[480px] overflow-y-auto snap-y snap-mandatory rounded-3xl bg-black border border-[var(--color-border-subtle)] scrollbar-none"
				style={{ scrollbarWidth: "none" }}
			>
				{items.map((item) => {
					const src =
						resolveStorageUrl(item.previewVideoUrl) ?? item.previewVideoUrl;
					const poster =
						resolveStorageUrl(item.thumbnailUrl) ?? item.thumbnailUrl;
					const isActive = activeId === item.id;
					return (
						<article
							key={item.id}
							data-feed-id={item.id}
							className="relative h-full w-full snap-start snap-always overflow-hidden bg-black"
						>
							<video
								ref={(el) => {
									if (el) videoRefs.current.set(item.id, el);
									else videoRefs.current.delete(item.id);
								}}
								src={src}
								poster={poster || undefined}
								className="absolute inset-0 w-full h-full object-contain"
								loop
								muted
								playsInline
								preload="metadata"
								onClick={() => setMuted((m) => !m)}
							/>
							{/* Mute badge */}
							<button
								type="button"
								onClick={() => setMuted((m) => !m)}
								aria-label={muted ? "Nyalakan suara" : "Bisukan"}
								className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md active:scale-95 transition-all z-10"
							>
								{muted ? (
									<VolumeX className="w-4 h-4" />
								) : (
									<Volume2 className="w-4 h-4" />
								)}
							</button>
							{/* Bottom info */}
							<div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
								<p className="text-xs font-bold text-white">
									@{item.creatorUsername}
								</p>
								<p className="text-sm font-semibold text-white/90 line-clamp-2 mt-0.5">
									{item.title}
								</p>
								<div className="flex items-center gap-3 mt-2 pointer-events-auto">
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/80">
										<Heart className="w-3.5 h-3.5 text-rose-400" />
										{item.likeCount.toLocaleString("id-ID")}
									</span>
									<Link
										href={`/preset/${item.slug}`}
										className="ml-auto px-4 py-2 rounded-xl bg-[var(--color-interactive-primary)] text-white text-xs font-bold active:scale-95 transition-all"
									>
										Buka Preset
									</Link>
								</div>
							</div>
							{!isActive && (
								<div className="absolute inset-0 bg-black/30 pointer-events-none" />
							)}
						</article>
					);
				})}
			</div>

			{/* Prev/next controls */}
			<div className="flex items-center justify-center gap-3 py-4">
				<button
					type="button"
					onClick={() => scrollBySlide(-1)}
					aria-label="Video sebelumnya"
					className="p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-white active:scale-95 transition-all"
				>
					<ChevronUp className="w-5 h-5" />
				</button>
				<span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
					Ketuk video untuk suara
				</span>
				<button
					type="button"
					onClick={() => scrollBySlide(1)}
					aria-label="Video berikutnya"
					className="p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-white active:scale-95 transition-all"
				>
					<ChevronDown className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}
