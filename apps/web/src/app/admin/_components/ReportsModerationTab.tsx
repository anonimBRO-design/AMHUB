"use client";

import {
	AlertCircle,
	AlertTriangle,
	Check,
	CheckCircle2,
	Clock,
	ExternalLink,
	Eye,
	Filter,
	Loader2,
	RefreshCw,
	Search,
	ShieldAlert,
	Trash2,
	X,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

interface AdminPresetItem {
	id: string;
	title: string;
	slug: string;
	thumbnail_url: string;
	file_type: string;
	category: string;
	status: "pending" | "published" | "rejected" | "removed";
	price?: number;
	is_paid?: boolean;
	download_count: number;
	like_count: number;
	created_at: string;
	users?: {
		id: string;
		username: string;
		display_name: string;
		avatar_url?: string | null;
	} | null;
}

export function ReportsModerationTab() {
	const [presets, setPresets] = useState<AdminPresetItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Action modal
	const [activeAction, setActiveAction] = useState<{
		preset: AdminPresetItem;
		type: "publish" | "reject" | "remove";
	} | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchPresets = useCallback(
		async (silent = false) => {
			if (!silent) setIsLoading(true);
			else setIsRefreshing(true);

			try {
				const params = new URLSearchParams();
				if (statusFilter !== "all") params.set("status", statusFilter);
				if (searchQuery.trim()) params.set("q", searchQuery.trim());
				params.set("limit", "40");

				const res = await fetch(`/api/admin/presets?${params.toString()}`);
				const json = await res.json().catch(() => ({}));
				if (!res.ok) {
					throw new Error(
						json.error?.message ||
							`[HTTP ${res.status}] Gagal mengambil data preset moderasi`,
					);
				}
				setPresets(json.data || []);
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Gagal memuat preset";
				setToast({ type: "error", message: msg });
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[statusFilter, searchQuery],
	);

	useEffect(() => {
		const timeout = setTimeout(() => {
			fetchPresets();
		}, 300);
		return () => clearTimeout(timeout);
	}, [fetchPresets]);

	const handleModerate = async () => {
		if (!activeAction) return;
		setIsSubmitting(true);

		const targetStatus =
			activeAction.type === "publish"
				? "published"
				: activeAction.type === "reject"
					? "rejected"
					: "removed";

		try {
			const res = await fetch(
				`/api/admin/presets/${activeAction.preset.id}/moderate`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						status: targetStatus,
						reason: rejectionReason.trim() || undefined,
					}),
				},
			);

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data?.error?.message || "Gagal memperbarui status");
			}

			setToast({
				type: "success",
				message: `Status preset "${activeAction.preset.title}" diubah menjadi ${targetStatus}!`,
			});
			setActiveAction(null);
			setRejectionReason("");
			fetchPresets(true);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal memoderasi preset";
			setToast({ type: "error", message: msg });
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStatusBadge = (status: AdminPresetItem["status"]) => {
		switch (status) {
			case "published":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						<CheckCircle2 className="w-3 h-3" /> Published
					</span>
				);
			case "pending":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
						<Clock className="w-3 h-3" /> Pending
					</span>
				);
			case "rejected":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
						<XCircle className="w-3 h-3" /> Rejected
					</span>
				);
			case "removed":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
						<Trash2 className="w-3 h-3" /> Removed
					</span>
				);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-200">
			{/* Toast */}
			{toast && (
				<div
					className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg ${
						toast.type === "success"
							? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
							: "bg-rose-950/40 border-rose-500/30 text-rose-300"
					}`}
				>
					<div className="flex items-center gap-2">
						{toast.type === "success" ? (
							<CheckCircle2 className="w-4 h-4" />
						) : (
							<AlertCircle className="w-4 h-4" />
						)}
						<span>{toast.message}</span>
					</div>
					<button
						type="button"
						onClick={() => setToast(null)}
						className="p-1 hover:opacity-75"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Filter & Search Bar */}
			<div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
				{/* Status Chips */}
				<div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
					{["all", "pending", "published", "rejected", "removed"].map(
						(status) => (
							<button
								key={status}
								type="button"
								onClick={() => setStatusFilter(status)}
								className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
									statusFilter === status
										? "bg-cyan-600 text-white shadow-sm"
										: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
								}`}
							>
								{status === "all" ? "Semua Status" : status}
							</button>
						),
					)}
				</div>

				{/* Search & Refresh */}
				<div className="flex items-center gap-2 w-full md:w-auto">
					<div className="relative flex-1 md:w-64">
						<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
						<input
							type="text"
							placeholder="Cari judul / slug preset..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-500"
						/>
					</div>

					<button
						type="button"
						onClick={() => fetchPresets(true)}
						disabled={isLoading || isRefreshing}
						className="p-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:text-white text-[var(--color-text-secondary)]"
						title="Refresh list"
					>
						<RefreshCw
							className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
						/>
					</button>
				</div>
			</div>

			{/* Presets Moderation Table */}
			<div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ShieldAlert className="w-5 h-5 text-cyan-400" />
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							Moderasi Konten & Preset
						</h3>
					</div>
					<span className="text-xs text-[var(--color-text-secondary)]">
						{presets.length} Preset ditemukan
					</span>
				</div>

				{isLoading ? (
					<div className="py-16 flex flex-col items-center justify-center gap-2 text-[var(--color-text-secondary)]">
						<Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
						<p className="text-xs">Memuat daftar preset...</p>
					</div>
				) : presets.length === 0 ? (
					<div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
						Tidak ada preset yang sesuai dengan kriteria filter.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] uppercase font-semibold">
									<th className="py-3 px-3">Preset</th>
									<th className="py-3 px-3">Creator</th>
									<th className="py-3 px-3">Tipe / Kategori</th>
									<th className="py-3 px-3">Stats</th>
									<th className="py-3 px-3">Status</th>
									<th className="py-3 px-3 text-right">Aksi Moderasi</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--color-border-subtle)]">
								{presets.map((preset) => (
									<tr
										key={preset.id}
										className="hover:bg-[var(--color-bg-elevated)] transition-colors"
									>
										{/* Title & Thumbnail */}
										<td className="py-3 px-3">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] overflow-hidden relative shrink-0">
													{preset.thumbnail_url ? (
														<img
															src={preset.thumbnail_url}
															alt={preset.title}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-tertiary)]">
															No Pic
														</div>
													)}
												</div>
												<div>
													<Link
														href={`/preset/${preset.slug}`}
														target="_blank"
														className="font-bold text-[var(--color-text-primary)] hover:text-cyan-400 transition-colors flex items-center gap-1"
													>
														<span>{preset.title}</span>
														<ExternalLink className="w-3 h-3 opacity-60" />
													</Link>
													<div className="text-[10px] text-[var(--color-text-tertiary)] font-mono mt-0.5">
														/{preset.slug}
													</div>
												</div>
											</div>
										</td>

										{/* Creator */}
										<td className="py-3 px-3">
											{preset.users ? (
												<Link
													href={`/u/${preset.users.username}`}
													target="_blank"
													className="text-[var(--color-text-primary)] hover:underline font-medium"
												>
													@{preset.users.username}
												</Link>
											) : (
												<span className="text-[var(--color-text-tertiary)]">
													Unknown
												</span>
											)}
										</td>

										{/* Type & Category */}
										<td className="py-3 px-3">
											<div className="font-semibold text-cyan-300 capitalize">
												{preset.category}
											</div>
											<div className="text-[10px] text-[var(--color-text-tertiary)] uppercase mt-0.5">
												{preset.file_type} {preset.is_paid && "• BERBAYAR"}
											</div>
										</td>

										{/* Stats */}
										<td className="py-3 px-3 text-[var(--color-text-secondary)]">
											<div>DL: {preset.download_count || 0}</div>
											<div className="text-[10px] text-[var(--color-text-tertiary)]">
												Likes: {preset.like_count || 0}
											</div>
										</td>

										{/* Status */}
										<td className="py-3 px-3 whitespace-nowrap">
											{getStatusBadge(preset.status)}
										</td>

										{/* Action buttons */}
										<td className="py-3 px-3 text-right whitespace-nowrap">
											<div className="inline-flex items-center gap-1">
												{preset.status !== "published" && (
													<button
														type="button"
														onClick={() =>
															setActiveAction({ preset, type: "publish" })
														}
														className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
													>
														Approve
													</button>
												)}

												{preset.status !== "rejected" && (
													<button
														type="button"
														onClick={() =>
															setActiveAction({ preset, type: "reject" })
														}
														className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
													>
														Reject
													</button>
												)}

												{preset.status !== "removed" && (
													<button
														type="button"
														onClick={() =>
															setActiveAction({ preset, type: "remove" })
														}
														className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
														title="Take down (Remove)"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Moderation Confirmation Modal */}
			{activeAction && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="w-full max-w-md rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl p-6 space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<AlertTriangle
									className={`w-5 h-5 ${
										activeAction.type === "publish"
											? "text-emerald-400"
											: "text-rose-400"
									}`}
								/>
								<h3 className="text-base font-bold text-[var(--color-text-primary)]">
									{activeAction.type === "publish"
										? "Publish Preset"
										: activeAction.type === "reject"
											? "Tolak Preset"
											: "Takedown Preset"}
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setActiveAction(null)}
								className="p-1 text-[var(--color-text-tertiary)] hover:text-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<p className="text-xs text-[var(--color-text-secondary)]">
							Konfirmasi tindakan untuk preset:{" "}
							<strong className="text-white">
								{activeAction.preset.title}
							</strong>
						</p>

						{activeAction.type !== "publish" && (
							<div>
								<label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
									Alasan Penolakan / Catatan:
								</label>
								<textarea
									rows={3}
									placeholder="Contoh: File XML rusak, melanggar hak cipta, atau preview tidak sesuai."
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-rose-500"
								/>
							</div>
						)}

						<div className="flex items-center justify-end gap-2 pt-2">
							<button
								type="button"
								onClick={() => setActiveAction(null)}
								className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleModerate}
								disabled={isSubmitting}
								className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 ${
									activeAction.type === "publish"
										? "bg-emerald-600 hover:bg-emerald-500"
										: "bg-rose-600 hover:bg-rose-500"
								}`}
							>
								{isSubmitting && (
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
								)}
								<span>Konfirmasi</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
