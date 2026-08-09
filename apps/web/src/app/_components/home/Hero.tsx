"use client";

import { useLanguage } from "@/i18n";
import type { PresetCardPreset } from "@presethub/ui";
import {
	ArrowRight,
	CheckCircle2,
	Download,
	Flame,
	Heart,
	Play,
	ShieldCheck,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";

interface HeroProps {
	stats?: {
		totalPresets: number;
		totalCreators: number;
		totalDownloads: number;
	};
	featuredPreset?: PresetCardPreset | null;
}

export function Hero({ stats, featuredPreset }: HeroProps) {
	const { t } = useLanguage();
	const totalPresets = stats?.totalPresets ?? 0;
	const totalCreators = stats?.totalCreators ?? 0;
	const totalDownloads = stats?.totalDownloads ?? 0;

	return (
		<section className="relative overflow-hidden pt-8 pb-12 md:py-16 px-6 sm:px-10 rounded-3xl backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] shadow-[0_16px_64px_rgba(0,0,0,0.5)] transition-all duration-300">
			{/* Ambient Floating Gradient Blur Orbs */}
			<div className="pointer-events-none absolute -top-40 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] animate-ambient-float" />
			<div className="pointer-events-none absolute -bottom-40 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-violet-600/15 via-pink-600/10 to-transparent rounded-full blur-[130px] animate-glow-pulse" />
			<div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[90px]" />

			<div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
				{/* Left Copy & Actions Column */}
				<div className="lg:col-span-7 space-y-6 text-center md:text-left">
					{/* Pill Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-purple-500/10 text-[var(--color-interactive-primary)] border border-purple-500/20 shadow-[0_0_16px_rgba(124,58,237,0.15)] transition-all duration-300 hover:scale-105 hover:bg-purple-500/15">
						<Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-400" />
						<span>Alight Motion Preset Hub #1</span>
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
					</div>

					{/* Title */}
					<h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
						Elevate Your Edits with <br className="hidden sm:inline" />
						<span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
							Pro Alight Motion
						</span>{" "}
						Presets
					</h1>

					{/* Subtitle */}
					<p className="font-body text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto md:mx-0 font-normal">
						Discover production-ready XML files, QR codes, and 1-tap links.
						Download trending velocity ramps, 3D camera shakes, and color
						grading created by top editors.
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-4 pt-2">
						<Link
							href="/explore"
							className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-8 rounded-2xl bg-gradient-to-r from-[var(--color-interactive-primary)] to-indigo-600 text-white font-extrabold text-sm shadow-[0_0_32px_rgba(124,58,237,0.4)] hover:shadow-[0_0_48px_rgba(124,58,237,0.6)] hover:opacity-95 active:scale-[0.97] transition-all duration-300 hover:-translate-y-0.5"
						>
							<span>Explore Catalog</span>
							<ArrowRight className="w-4 h-4" />
						</Link>
						<Link
							href="/upload"
							className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-8 rounded-2xl backdrop-blur-xl bg-white/[0.04] text-[var(--color-text-primary)] font-extrabold text-sm border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.2] hover:shadow-[0_0_24px_rgba(124,58,237,0.2)] active:scale-[0.97] transition-all duration-300 hover:-translate-y-0.5"
						>
							<Zap className="w-4 h-4 text-amber-400" />
							<span>Upload Preset</span>
						</Link>
					</div>

					{/* Quick Stats Grid (Driven 100% by Supabase) */}
					<div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-white/[0.08] max-w-lg mx-auto md:mx-0">
						<div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
							<div className="flex items-center gap-1.5 text-emerald-400 font-display font-black text-xl sm:text-2xl">
								<TrendingUp className="w-4 h-4 hidden sm:inline" />
								<span>
									{totalPresets > 1000
										? `${(totalPresets / 1000).toFixed(1)}K+`
										: totalPresets}
								</span>
							</div>
							<span className="font-body text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
								XML Presets
							</span>
						</div>

						<div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
							<div className="flex items-center gap-1.5 text-indigo-400 font-display font-black text-xl sm:text-2xl">
								<ShieldCheck className="w-4 h-4 hidden sm:inline" />
								<span>
									{totalCreators > 1000
										? `${(totalCreators / 1000).toFixed(1)}K+`
										: totalCreators}
								</span>
							</div>
							<span className="font-body text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
								Creators
							</span>
						</div>

						<div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
							<div className="flex items-center gap-1.5 text-purple-400 font-display font-black text-xl sm:text-2xl">
								<Zap className="w-4 h-4 hidden sm:inline" />
								<span>
									{totalDownloads > 1000
										? `${(totalDownloads / 1000).toFixed(1)}K+`
										: totalDownloads}
								</span>
							</div>
							<span className="font-body text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
								Downloads
							</span>
						</div>
					</div>
				</div>

				{/* Right Showcase Column (Featured Preset from Supabase or Empty State) */}
				<div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
					<div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square lg:aspect-[4/5] flex items-center justify-center">
						{/* Background Card */}
						<div className="absolute top-4 -right-2 w-72 h-96 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-black/60 border border-white/10 shadow-2xl rotate-6 transform transition-transform duration-500 hover:rotate-3 hidden sm:block pointer-events-none" />

						{/* Main Featured Showcase Glass Card */}
						<div className="relative z-20 w-full rounded-3xl backdrop-blur-2xl bg-[#0f0e14]/90 border border-white/[0.12] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_48px_rgba(124,58,237,0.25)] transition-transform duration-500 hover:scale-[1.02] space-y-4">
							{featuredPreset ? (
								<Link
									href={`/preset/${featuredPreset.slug}`}
									className="block space-y-4 group"
								>
									{/* Card Thumbnail Area with Play Button */}
									<div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-purple-950/40 border border-white/10">
										{featuredPreset.thumbnailUrl ? (
											<img
												src={featuredPreset.thumbnailUrl}
												alt={featuredPreset.title}
												className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
											/>
										) : (
											<div className="w-full h-full bg-purple-900/30" />
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-[#0f0e14] via-transparent to-black/40" />

										{/* Top Badges */}
										<div className="absolute top-3 left-3 flex items-center gap-2">
											<span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-md flex items-center gap-1">
												<Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
												FEATURED
											</span>
											<span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-purple-600/80 text-white backdrop-blur-md border border-white/15 shadow-md uppercase">
												{featuredPreset.category}
											</span>
										</div>

										{/* Play Button Overlay */}
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
												<Play className="w-5 h-5 fill-white translate-x-0.5" />
											</div>
										</div>

										<div className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
											<CheckCircle2 className="w-3 h-3" />
											{featuredPreset.difficulty || "XML"}
										</div>
									</div>

									{/* Card Details */}
									<div className="space-y-3">
										<div>
											<h3 className="font-display text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
												{featuredPreset.title}
											</h3>
											<p className="font-body text-xs text-[var(--color-text-secondary)] line-clamp-1">
												{featuredPreset.description ||
													"Alight Motion Pro Preset"}
											</p>
										</div>

										{/* Creator Row & Quick Action */}
										<div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
											<div className="flex items-center gap-2.5">
												{featuredPreset.creator.avatarUrl ? (
													<img
														src={featuredPreset.creator.avatarUrl}
														alt={featuredPreset.creator.displayName}
														className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/50"
													/>
												) : (
													<div className="w-8 h-8 rounded-full bg-purple-600/40 border border-purple-400 flex items-center justify-center text-white font-bold text-xs">
														{featuredPreset.creator.displayName
															?.slice(0, 2)
															.toUpperCase()}
													</div>
												)}
												<div>
													<span className="font-body text-xs font-bold text-white block">
														{featuredPreset.creator.displayName}
													</span>
													<span className="font-body text-[10px] text-purple-300 font-semibold">
														@{featuredPreset.creator.username}
													</span>
												</div>
											</div>

											<div className="flex items-center gap-3 text-xs font-semibold">
												<span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
													<Heart className="w-3.5 h-3.5 fill-rose-400" />
													{featuredPreset.likeCount}
												</span>
												<span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
													<Download className="w-3.5 h-3.5" />
													{featuredPreset.downloadCount}
												</span>
											</div>
										</div>
									</div>
								</Link>
							) : (
								<div className="p-8 text-center space-y-3 text-white my-auto">
									<div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
										<Sparkles className="w-6 h-6 animate-pulse" />
									</div>
									<h4 className="font-display font-bold text-base text-white">
										No published presets yet
									</h4>
									<p className="font-body text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
										Be the first creator to upload a preset to get featured on
										the homepage!
									</p>
									<Link
										href="/upload"
										className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
									>
										<Zap className="w-4 h-4 text-amber-300" />
										<span>Upload Preset</span>
									</Link>
								</div>
							)}
						</div>

						{/* Floating Decorative Glass Badge 1 (Top Left) */}
						<div className="absolute -top-4 -left-4 z-30 px-3.5 py-2 rounded-2xl backdrop-blur-xl bg-purple-950/80 border border-purple-500/30 text-white shadow-xl flex items-center gap-2 animate-ambient-float">
							<div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
								<Zap className="w-3.5 h-3.5" />
							</div>
							<div className="text-left">
								<span className="text-[10px] font-bold text-purple-300 block uppercase tracking-wider">
									Format
								</span>
								<span className="text-xs font-black text-white">
									XML + QR Code
								</span>
							</div>
						</div>

						{/* Floating Decorative Glass Badge 2 (Bottom Right) */}
						<div className="absolute -bottom-5 -right-4 z-30 px-4 py-2.5 rounded-2xl backdrop-blur-xl bg-indigo-950/80 border border-indigo-500/30 text-white shadow-2xl flex items-center gap-2.5 animate-glow-pulse">
							<div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
								⚡
							</div>
							<div className="text-left">
								<span className="text-[10px] font-bold text-emerald-300 block uppercase tracking-wider">
									Direct Import
								</span>
								<span className="text-xs font-black text-white">
									1-Tap alight.link
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
