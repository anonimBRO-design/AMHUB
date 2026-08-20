"use client";

import { useAuth } from "@/context/AuthContext";
import {
	AlignLeft,
	Calendar,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Edit3,
	ExternalLink,
	Eye,
	FileCode,
	Layers,
	Ratio,
	Sparkles,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface DescriptionSectionProps {
	preset: {
		id: string;
		title: string;
		description?: string | null;
		category: string;
		difficulty: "beginner" | "intermediate" | "advanced";
		fileType?: string;
		aspectRatio?: string;
		createdAt?: string;
		creator: {
			id?: string;
			username?: string;
			displayName?: string;
		};
	};
	currentUserId?: string;
}

/**
 * Format raw text into rich formatted elements (URLs, @mentions, bullet points, line breaks, bold)
 */
function renderFormattedDescription(text: string) {
	if (!text) return null;

	const lines = text.split("\n");

	return lines.map((line, lineIdx) => {
		const trimmed = line.trim();

		// Empty lines
		if (!trimmed) {
			return <div key={`empty-${lineIdx}`} className="h-3" />;
		}

		// Bullet points (- or * or •)
		const isBullet = /^[-*•]\s+/.test(trimmed);
		const cleanLine = isBullet ? trimmed.replace(/^[-*•]\s+/, "") : line;

		// Process bold (**text**) and mentions (@username) and links (https://...)
		const parts = cleanLine.split(/(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+|\*\*[^*]+\*\*)/g);

		const renderedParts = parts.map((part, partIdx) => {
			if (!part) return null;

			// Links
			if (/^https?:\/\//.test(part)) {
				return (
					<a
						key={partIdx}
						href={part}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-0.5 text-[var(--color-interactive-primary)] hover:underline font-medium break-all"
					>
						<span>{part.length > 35 ? `${part.slice(0, 35)}...` : part}</span>
						<ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70 shrink-0" />
					</a>
				);
			}

			// Mentions (@user)
			if (/^@[a-zA-Z0-9_]+$/.test(part)) {
				const username = part.slice(1);
				return (
					<Link
						key={partIdx}
						href={`/u/${username}`}
						className="text-purple-400 font-semibold hover:underline bg-purple-500/10 px-1.5 py-0.5 rounded-md"
					>
						{part}
					</Link>
				);
			}

			// Bold (**text**)
			if (/^\*\*[^*]+\*\*$/.test(part)) {
				return (
					<strong key={partIdx} className="font-bold text-[var(--color-text-primary)]">
						{part.slice(2, -2)}
					</strong>
				);
			}

			return <span key={partIdx}>{part}</span>;
		});

		if (isBullet) {
			return (
				<div key={lineIdx} className="flex items-start gap-2 pl-1 py-0.5">
					<span className="w-1.5 h-1.5 rounded-sm bg-[var(--color-interactive-primary)] mt-2 shrink-0" />
					<div className="flex-1 leading-relaxed">{renderedParts}</div>
				</div>
			);
		}

		return (
			<p key={lineIdx} className="leading-relaxed">
				{renderedParts}
			</p>
		);
	});
}

export function DescriptionSection({
	preset,
	currentUserId,
}: DescriptionSectionProps) {
	const router = useRouter();
	const { currentUser } = useAuth();
	const [isExpanded, setIsExpanded] = useState(false);
	const [description, setDescription] = useState(preset.description || "");
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(preset.description || "");
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isOwner = Boolean(
		(currentUserId && preset.creator?.id && currentUserId === preset.creator.id) ||
		(currentUser?.id && preset.creator?.id && currentUser.id === preset.creator.id) ||
		(currentUser?.username && preset.creator?.username && currentUser.username.toLowerCase() === preset.creator.username.toLowerCase()),
	);

	const isLong = (description?.length ?? 0) > 280;

	const handleSaveDescription = async () => {
		setIsSaving(true);
		setError(null);
		try {
			const res = await fetch(`/api/presets/${preset.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ description: editValue.trim() }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error?.message || data?.error || "Gagal mengupdate deskripsi");
			}

			setDescription(editValue.trim());
			setIsEditing(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 2500);
			router.refresh();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan");
		} finally {
			setIsSaving(false);
		}
	};

	const formattedDate = preset.createdAt
		? new Date(preset.createdAt).toLocaleDateString("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric",
			})
		: null;

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-5 shadow-lg relative">
			{/* Header with Title & Edit Action */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<AlignLeft className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
							Deskripsi & Detail Preset
						</h2>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Informasi cara pakai dan catatan dari creator
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{saveSuccess && (
						<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md animate-fade-in">
							<Check className="w-3.5 h-3.5" />
							<span>Tersimpan!</span>
						</span>
					)}

					{isOwner && !isEditing && (
						<button
							type="button"
							onClick={() => {
								setEditValue(description);
								setIsEditing(true);
							}}
							className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:text-white border border-[var(--color-border-subtle)] text-xs font-bold transition-all active:scale-95 shadow-sm"
						>
							<Edit3 className="w-3.5 h-3.5 text-purple-400" />
							<span>Edit Deskripsi</span>
						</button>
					)}
				</div>
			</div>

			{/* Quick Specification Metadata Badges */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60 text-xs">
				<div className="flex items-center gap-2 px-2 py-1">
					<Ratio className="w-4 h-4 text-purple-400 shrink-0" />
					<div>
						<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Rasio Layar
						</span>
						<span className="font-bold text-[var(--color-text-primary)]">
							{preset.aspectRatio || "9:16 (Vertical)"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 px-2 py-1">
					<Layers className="w-4 h-4 text-emerald-400 shrink-0" />
					<div>
						<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Kesulitan
						</span>
						<span className="font-bold text-[var(--color-text-primary)] capitalize">
							{preset.difficulty || "Semua Tingkat"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 px-2 py-1">
					<FileCode className="w-4 h-4 text-blue-400 shrink-0" />
					<div>
						<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Format File
						</span>
						<span className="font-bold text-[var(--color-text-primary)] uppercase">
							{preset.fileType || "XML Project"}
						</span>
					</div>
				</div>

				{formattedDate && (
					<div className="flex items-center gap-2 px-2 py-1">
						<Calendar className="w-4 h-4 text-amber-400 shrink-0" />
						<div>
							<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
								Diupload
							</span>
							<span className="font-bold text-[var(--color-text-primary)]">
								{formattedDate}
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Main Description Body / Edit Mode */}
			{isEditing ? (
				<div className="space-y-3 p-4 rounded-lg bg-[var(--color-bg-base)] border border-purple-500/30 shadow-inner">
					<div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
						<span className="font-semibold text-[var(--color-text-primary)]">
							Ubah Deskripsi Preset
						</span>
						<span className={editValue.length > 1800 ? "text-amber-400 font-bold" : ""}>
							{editValue.length} / 2000 karakter
						</span>
					</div>

					<textarea
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						placeholder="Tulis deskripsi preset, credit lagu/sound, font yang dipakai, atau tips impor ke Alight Motion... (Gunakan **tebal**, - bullet, atau @username)"
						rows={6}
						maxLength={2000}
						className="w-full p-3.5 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] resize-y leading-relaxed font-sans"
					/>

					{error && (
						<p className="text-xs text-rose-400 font-medium">{error}</p>
					)}

					<div className="flex items-center justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={() => {
								setIsEditing(false);
								setEditValue(description);
								setError(null);
							}}
							disabled={isSaving}
							className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-white transition-colors"
						>
							Batal
						</button>
						<button
							type="button"
							onClick={handleSaveDescription}
							disabled={isSaving}
							className="px-5 py-2 rounded-lg bg-[var(--color-interactive-primary)] hover:bg-[var(--color-interactive-primary-hover)] text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-[var(--color-interactive-primary)]/25 flex items-center gap-1.5"
						>
							{isSaving ? (
								<>
									<div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
									<span>Menyimpan...</span>
								</>
							) : (
								<>
									<Check className="w-4 h-4" />
									<span>Simpan Perubahan</span>
								</>
							)}
						</button>
					</div>
				</div>
			) : (
				<div className="space-y-3">
					<div
						className={`relative text-xs sm:text-sm text-[var(--color-text-secondary)] transition-all duration-300 ${
							!isExpanded && isLong ? "max-h-[170px] overflow-hidden" : ""
						}`}
					>
						{description.trim() ? (
							<div className="space-y-2 leading-relaxed">
								{renderFormattedDescription(description)}
							</div>
						) : (
							<div className="p-4 rounded-lg bg-[var(--color-bg-base)] text-center text-xs text-[var(--color-text-tertiary)] italic">
								Creator belum menambahkan deskripsi untuk preset ini.
							</div>
						)}

						{!isExpanded && isLong && (
							<div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[var(--color-bg-surface)] to-transparent pointer-events-none" />
						)}
					</div>

					{isLong && (
						<div className="pt-1">
							<button
								type="button"
								onClick={() => setIsExpanded(!isExpanded)}
								className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-interactive-primary)] hover:underline"
							>
								{isExpanded ? (
									<>
										<span>Tampilkan Lebih Sedikit</span>
										<ChevronUp className="w-3.5 h-3.5" />
									</>
								) : (
									<>
										<span>Baca Selengkapnya</span>
										<ChevronDown className="w-3.5 h-3.5" />
									</>
								)}
							</button>
						</div>
					)}
				</div>
			)}
		</section>
	);
}
