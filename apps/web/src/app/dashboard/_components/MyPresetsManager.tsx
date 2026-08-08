"use client";

import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Download,
	Edit3,
	Eye,
	Globe,
	Grid,
	Heart,
	Loader2,
	Lock,
	MoreVertical,
	Search,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DeletePresetDialog } from "./DeletePresetDialog";
import { EditPresetModal } from "./EditPresetModal";
import { EmptyState } from "./EmptyState";

interface PresetItem {
	id: string;
	title: string;
	slug: string;
	description?: string | null;
	thumbnail_url: string;
	file_type: "xml" | "qr" | "link";
	category: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	tags: string[];
	download_count: number;
	like_count: number;
	view_count: number;
	status: "pending" | "published" | "rejected" | "removed";
	created_at: string;
}

interface MyPresetsManagerProps {
	initialPresets: PresetItem[];
}

type TabStatus = "all" | "published" | "draft" | "archived";

export function MyPresetsManager({ initialPresets }: MyPresetsManagerProps) {
	const [activeTab, setActiveTab] = useState<TabStatus>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [presets, setPresets] = useState<PresetItem[]>(initialPresets);
	const [total, setTotal] = useState(initialPresets.length);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Modals state
	const [editingPreset, setEditingPreset] = useState<PresetItem | null>(null);
	const [deletingPreset, setDeletingPreset] = useState<PresetItem | null>(null);
	const [actionPendingId, setActionPendingId] = useState<string | null>(null);

	const fetchPresets = useCallback(async () => {
		setIsLoading(true);
		try {
			const queryParams = new URLSearchParams({
				page: page.toString(),
				limit: "12",
				status: activeTab,
			});
			if (searchQuery.trim()) {
				queryParams.set("search", searchQuery.trim());
			}

			const res = await fetch(`/api/presets/creator?${queryParams}`);
			if (res.ok) {
				const json = await res.json();
				setPresets(json.data || []);
				if (json.meta?.pagination) {
					setTotal(json.meta.pagination.total);
					setHasMore(json.meta.pagination.hasMore);
				}
			}
		} catch (err) {
			console.error("Failed to fetch creator presets:", err);
		} finally {
			setIsLoading(false);
		}
	}, [page, activeTab, searchQuery]);

	useEffect(() => {
		fetchPresets();
	}, [fetchPresets]);

	async function handleToggleStatus(
		preset: PresetItem,
		newStatus: "published" | "pending" | "removed",
	) {
		setActionPendingId(preset.id);
		try {
			const res = await fetch(`/api/presets/${preset.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			if (res.ok) {
				await fetchPresets();
			}
		} catch (err) {
			console.error("Failed to update status:", err);
		} finally {
			setActionPendingId(null);
		}
	}

	return (
		<section className="space-y-6">
			{/* Top Bar: Title & Search */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
						<Grid className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
							Manage Your Presets
						</h2>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Total {total} presets uploaded
						</p>
					</div>
				</div>

				{/* Search box */}
				<div className="relative w-full sm:w-64">
					<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
					<input
						type="text"
						value={searchQuery}
						placeholder="Search your presets..."
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setPage(1);
						}}
						className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none text-xs text-[var(--color-text-primary)] transition-all"
					/>
				</div>
			</div>

			{/* Status Tabs */}
			<div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3 overflow-x-auto text-xs font-semibold select-none">
				{(
					[
						{ id: "all", label: "All Presets" },
						{ id: "published", label: "Published" },
						{ id: "draft", label: "Drafts (Pending)" },
						{ id: "archived", label: "Archived (Removed)" },
					] as const
				).map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => {
							setActiveTab(tab.id);
							setPage(1);
						}}
						className={`px-4 py-2 rounded-2xl transition-all whitespace-nowrap ${
							activeTab === tab.id
								? "bg-[var(--color-interactive-primary)] text-white shadow-sm font-bold"
								: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Grid Content */}
			{isLoading ? (
				<div className="p-12 text-center text-xs text-[var(--color-text-tertiary)] flex items-center justify-center gap-2">
					<Loader2 className="w-4 h-4 animate-spin text-[var(--color-interactive-primary)]" />
					Loading presets...
				</div>
			) : presets.length === 0 ? (
				<EmptyState type="presets" />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{presets.map((preset) => {
						const isPendingAction = actionPendingId === preset.id;
						const isPublished = preset.status === "published";
						const isDraft = preset.status === "pending";
						const isArchived = preset.status === "removed";

						return (
							<div
								key={preset.id}
								className="group relative rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden hover:border-[var(--color-interactive-primary)]/40 transition-all shadow-md flex flex-col justify-between"
							>
								{/* Thumbnail & Badges */}
								<div className="relative aspect-video w-full bg-[var(--color-bg-elevated)] overflow-hidden">
									<Image
										src={preset.thumbnail_url || "/placeholder.jpg"}
										alt={preset.title}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

									{/* Status Badge */}
									<div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm">
										{isPublished && (
											<span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg">
												<Globe className="w-3 h-3" /> Published
											</span>
										)}
										{isDraft && (
											<span className="flex items-center gap-1 text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg">
												<Lock className="w-3 h-3" /> Draft
											</span>
										)}
										{isArchived && (
											<span className="flex items-center gap-1 text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-lg">
												Archived
											</span>
										)}
									</div>

									{/* File type badge */}
									<div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold uppercase border border-white/10">
										{preset.file_type}
									</div>

									{/* Title overlay */}
									<div className="absolute bottom-3 left-3 right-3">
										<Link
											href={`/preset/${preset.slug}`}
											className="text-sm font-bold text-white hover:text-[var(--color-interactive-primary)] transition-colors line-clamp-1 drop-shadow-md"
										>
											{preset.title}
										</Link>
									</div>
								</div>

								{/* Details Body */}
								<div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
									<div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)] font-medium">
										<span className="flex items-center gap-1">
											<Calendar className="w-3.5 h-3.5" />
											{new Date(preset.created_at).toLocaleDateString()}
										</span>
										<span className="capitalize px-2 py-0.5 rounded-lg bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-bold text-[10px]">
											{preset.category}
										</span>
									</div>

									{/* Stats Grid */}
									<div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-center text-xs font-bold">
										<div className="space-y-0.5">
											<span className="text-[10px] uppercase text-[var(--color-text-tertiary)] block">
												Downloads
											</span>
											<span className="text-emerald-400 flex items-center justify-center gap-1">
												<Download className="w-3 h-3" /> {preset.download_count}
											</span>
										</div>
										<div className="space-y-0.5">
											<span className="text-[10px] uppercase text-[var(--color-text-tertiary)] block">
												Likes
											</span>
											<span className="text-rose-400 flex items-center justify-center gap-1">
												<Heart className="w-3 h-3" /> {preset.like_count}
											</span>
										</div>
										<div className="space-y-0.5">
											<span className="text-[10px] uppercase text-[var(--color-text-tertiary)] block">
												Views
											</span>
											<span className="text-blue-400 flex items-center justify-center gap-1">
												<Eye className="w-3 h-3" /> {preset.view_count}
											</span>
										</div>
									</div>

									{/* Action Bar */}
									<div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)] text-xs font-semibold">
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setEditingPreset(preset)}
												className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-interactive-primary)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center gap-1"
												title="Edit Preset"
											>
												<Edit3 className="w-4 h-4" />
												<span>Edit</span>
											</button>

											<button
												type="button"
												onClick={() => setDeletingPreset(preset)}
												className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center gap-1"
												title="Delete Preset"
											>
												<Trash2 className="w-4 h-4" />
												<span>Delete</span>
											</button>
										</div>

										{/* Toggle Publish / Unpublish */}
										{isPublished ? (
											<button
												type="button"
												disabled={isPendingAction}
												onClick={() => handleToggleStatus(preset, "pending")}
												className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 font-bold transition-all text-[11px] flex items-center gap-1"
											>
												{isPendingAction ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													"Unpublish"
												)}
											</button>
										) : (
											<button
												type="button"
												disabled={isPendingAction}
												onClick={() => handleToggleStatus(preset, "published")}
												className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-bold transition-all text-[11px] flex items-center gap-1"
											>
												{isPendingAction ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													"Publish"
												)}
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Pagination controls */}
			{(page > 1 || hasMore) && (
				<div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)] text-xs font-semibold">
					<button
						type="button"
						disabled={page === 1 || isLoading}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] disabled:opacity-40 hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1"
					>
						<ChevronLeft className="w-4 h-4" /> Previous
					</button>

					<span className="text-[var(--color-text-tertiary)]">Page {page}</span>

					<button
						type="button"
						disabled={!hasMore || isLoading}
						onClick={() => setPage((p) => p + 1)}
						className="px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] disabled:opacity-40 hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1"
					>
						Next <ChevronRight className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Modals */}
			<EditPresetModal
				preset={editingPreset}
				isOpen={Boolean(editingPreset)}
				onClose={() => setEditingPreset(null)}
				onSuccess={fetchPresets}
			/>

			<DeletePresetDialog
				preset={deletingPreset}
				isOpen={Boolean(deletingPreset)}
				onClose={() => setDeletingPreset(null)}
				onSuccess={fetchPresets}
			/>
		</section>
	);
}
