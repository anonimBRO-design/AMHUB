"use client";

import { useLanguage } from "@/i18n";
import { type AmXmlMetadata, parseAlightMotionXml } from "@/lib/xml/parse-am-xml";
import {
	Code2,
	ExternalLink,
	Eye,
	FileText,
	Layers,
	Lock,
	Music,
	Search,
	Sparkles,
	Type,
	Video,
	Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface XmlAssetInspectorProps {
	fileUrl?: string | null;
	isLocked?: boolean;
	category?: string;
}

export function XmlAssetInspector({
	fileUrl,
	isLocked = false,
	category,
}: XmlAssetInspectorProps) {
	const { t } = useLanguage();
	const [metadata, setMetadata] = useState<AmXmlMetadata | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isLocked || !fileUrl) return;

		let isCancelled = false;
		const fetchAndParse = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch(fileUrl);
				if (!res.ok) throw new Error("Failed to fetch XML preset file");
				const text = await res.text();
				if (!isCancelled) {
					const parsed = parseAlightMotionXml(text);
					setMetadata(parsed);
				}
			} catch (e) {
				if (!isCancelled) {
					console.warn("Could not inspect XML:", e);
					setError("Could not parse XML preview");
				}
			} finally {
				if (!isCancelled) setIsLoading(false);
			}
		};

		fetchAndParse();
		return () => {
			isCancelled = true;
		};
	}, [fileUrl, isLocked]);

	// If no XML file URL is associated with this preset, return null or fallback
	if (!fileUrl && !isLocked) return null;

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-5 shadow-lg relative overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
						<Code2 className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
							<span>{t.presetDetail.inspectorTitle}</span>
							<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
								AUTO-PARSER
							</span>
						</h2>
						<p className="text-xs text-[var(--color-text-secondary)]">
							{t.presetDetail.inspectorSubtitle}
						</p>
					</div>
				</div>

				{metadata?.projectInfo.fps && (
					<div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-text-tertiary)] bg-[var(--color-bg-base)] px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)]">
						<span>{metadata.projectInfo.fps} FPS</span>
						{metadata.projectInfo.aspectRatio && (
							<>
								<span>•</span>
								<span className="text-cyan-400">
									{metadata.projectInfo.aspectRatio}
								</span>
							</>
						)}
					</div>
				)}
			</div>

			{/* Locked state */}
			{isLocked ? (
				<div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col items-center text-center space-y-2">
					<div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
						<Lock className="w-5 h-5" />
					</div>
					<p className="text-xs text-[var(--color-text-secondary)] max-w-sm">
						{t.presetDetail.lockedInspectorNotice}
					</p>
				</div>
			) : isLoading ? (
				<div className="py-8 text-center space-y-2">
					<div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-xs text-[var(--color-text-tertiary)]">
						{t.presetDetail.inspectingXml}
					</p>
				</div>
			) : metadata ? (
				<div className="space-y-4">
					{/* Layer Breakdown Bar */}
					{metadata.layerStats.total > 0 && (
						<div className="p-3 rounded-xl bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
							<span className="font-bold text-[var(--color-text-tertiary)] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
								<Layers className="w-3.5 h-3.5 text-cyan-400" />
								{t.presetDetail.layerBreakdown}:
							</span>

							<div className="flex flex-wrap items-center gap-2">
								{metadata.layerStats.shape > 0 && (
									<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
										<Wand2 className="w-3 h-3 text-purple-400" />
										{metadata.layerStats.shape} {t.presetDetail.shapes}
									</span>
								)}
								{metadata.layerStats.text > 0 && (
									<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
										<Type className="w-3 h-3 text-emerald-400" />
										{metadata.layerStats.text} {t.presetDetail.texts}
									</span>
								)}
								{metadata.layerStats.media > 0 && (
									<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-semibold">
										<Video className="w-3 h-3 text-blue-400" />
										{metadata.layerStats.media} {t.presetDetail.mediaItems}
									</span>
								)}
								{metadata.layerStats.audio > 0 && (
									<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-semibold">
										<Music className="w-3 h-3 text-rose-400" />
										{metadata.layerStats.audio} {t.presetDetail.audios}
									</span>
								)}
							</div>
						</div>
					)}

					{/* 2-Column Grid: Fonts Required + Effects Used */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Fonts Required Box */}
						<div className="p-4 rounded-xl bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)] space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Type className="w-4 h-4 text-emerald-400" />
									<h3 className="text-xs font-bold text-[var(--color-text-primary)]">
										{t.presetDetail.fontsRequired}
									</h3>
								</div>
								<span className="text-[10px] text-[var(--color-text-tertiary)]">
									{metadata.fonts.length} font
								</span>
							</div>
							<p className="text-[11px] text-[var(--color-text-tertiary)]">
								{t.presetDetail.fontsRequiredDesc}
							</p>

							{metadata.fonts.length > 0 ? (
								<div className="flex flex-wrap gap-2 pt-1">
									{metadata.fonts.map((font) => (
										<a
											key={font.name}
											href={font.searchUrl}
											target="_blank"
											rel="noopener noreferrer"
											title={`${t.presetDetail.downloadFont}: ${font.cleanName}`}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-emerald-500/15 text-xs font-bold text-[var(--color-text-secondary)] hover:text-emerald-300 border border-[var(--color-border-subtle)] hover:border-emerald-500/40 transition-all active:scale-95 group"
										>
											<span className="truncate max-w-[150px]">
												{font.cleanName}
											</span>
											<Search className="w-3 h-3 opacity-60 group-hover:opacity-100 text-emerald-400" />
										</a>
									))}
								</div>
							) : (
								<div className="p-2.5 rounded-lg bg-[var(--color-bg-surface)] text-[11px] text-[var(--color-text-tertiary)] italic">
									{t.presetDetail.noFontsDetected}
								</div>
							)}
						</div>

						{/* Effects Used Box */}
						<div className="p-4 rounded-xl bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)] space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-cyan-400" />
									<h3 className="text-xs font-bold text-[var(--color-text-primary)]">
										{t.presetDetail.effectsUsed}
									</h3>
								</div>
								<span className="text-[10px] text-[var(--color-text-tertiary)]">
									{metadata.effects.length} efek
								</span>
							</div>
							<p className="text-[11px] text-[var(--color-text-tertiary)]">
								{t.presetDetail.effectsUsedDesc}
							</p>

							{metadata.effects.length > 0 ? (
								<div className="flex flex-wrap gap-2 pt-1 max-h-[140px] overflow-y-auto pr-1">
									{metadata.effects.map((effect) => (
										<span
											key={effect.id}
											className="inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium"
										>
											{effect.name}
										</span>
									))}
								</div>
							) : (
								<div className="p-2.5 rounded-lg bg-[var(--color-bg-surface)] text-[11px] text-[var(--color-text-tertiary)] italic">
									{t.presetDetail.noEffectsDetected}
								</div>
							)}
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}
