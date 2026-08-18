"use client";

import type {
	CreateCreatorPermissionInput,
	CreatorPermission,
	CreatorPermissionStats,
	CreatorPermissionStatus,
	UpdateCreatorPermissionInput,
} from "@presethub/types";
import {
	AlertCircle,
	Check,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	Eye,
	HelpCircle,
	Loader2,
	MessageSquare,
	Plus,
	RefreshCw,
	Search,
	Sparkles,
	Trash2,
	UserCheck,
	UserPlus,
	UserX,
	Users,
	X,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

export function generatePermissionMessage(
	creatorName: string,
	targetPresetName?: string | null,
): string {
	const name = creatorName.trim() ? creatorName.trim() : "kak";
	const presetMention = targetPresetName?.trim()
		? `preset "${targetPresetName.trim()}"`
		: "preset-preset";

	return `Halo ${name}, izin ya 🙏 Saya tertarik sama ${presetMention} yang kakak buat. Saya boleh menggunakan/mengambil preset tersebut untuk dipasang di website project saya, AMHUB? Saya akan tetap mencantumkan credit ke kakak sebagai kreatornya. Kalau boleh, kira-kira maksimal berapa preset yang diperbolehkan untuk saya ambil dan gunakan di AMHUB? Kalau tidak diperbolehkan juga tidak masalah. Terima kasih banyak, ${name}! 🙏`;
}

export function CreatorPermissionsTab() {
	const [permissions, setPermissions] = useState<CreatorPermission[]>([]);
	const [stats, setStats] = useState<CreatorPermissionStats>({
		total: 0,
		pending: 0,
		contacted: 0,
		approved: 0,
		rejected: 0,
	});
	const [activeStatus, setActiveStatus] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	// Toast
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const showToast = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3500);
	};

	// Add Modal State
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [addForm, setAddForm] = useState<{
		username: string;
		displayName: string;
		targetPreset: string;
		customMessage: string;
	}>({
		username: "",
		displayName: "",
		targetPreset: "",
		customMessage: "",
	});
	const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);

	// Status / Approval Modal State
	const [selectedRecord, setSelectedRecord] =
		useState<CreatorPermission | null>(null);
	const [statusModalType, setStatusModalType] = useState<
		"approve" | "reject" | "edit" | null
	>(null);
	const [statusForm, setStatusForm] = useState<{
		status: CreatorPermissionStatus;
		creditDisplayName: string;
		maxAllowedPresets: number;
		notes: string;
	}>({
		status: "approved",
		creditDisplayName: "",
		maxAllowedPresets: 1,
		notes: "",
	});
	const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

	// Delete State
	const [deleteTarget, setDeleteTarget] = useState<CreatorPermission | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchPermissions = useCallback(async (query = "", status = "all") => {
		setIsLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams();
			if (query) params.set("q", query);
			if (status && status !== "all") params.set("status", status);

			const res = await fetch(
				`/api/admin/creator-permissions?${params.toString()}`,
			);
			const json = await res.json();
			if (!res.ok) {
				throw new Error(
					json.error?.message || "Failed to load creator permissions",
				);
			}

			setPermissions(json.data?.permissions || []);
			if (json.data?.stats) {
				setStats(json.data.stats);
			}
		} catch (err) {
			console.error("Fetch creator permissions error:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load permissions",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchPermissions(searchQuery, activeStatus);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, activeStatus, fetchPermissions]);

	// Action: Copy Message & Open TikTok
	const handleCopyAndOpenTikTok = async (item: CreatorPermission) => {
		const message =
			item.drafted_message ||
			generatePermissionMessage(
				item.creator_display_name || item.creator_username,
			);

		try {
			await navigator.clipboard.writeText(message);
			setCopiedId(item.id);
			setTimeout(() => setCopiedId(null), 3000);
			showToast("Pesan izin berhasil dicopy ke clipboard!");

			// Open TikTok profile in new tab
			window.open(item.profile_url, "_blank", "noopener,noreferrer");

			// If status was pending, advance to contacted
			if (item.status === "pending") {
				const res = await fetch(`/api/admin/creator-permissions/${item.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: "contacted" }),
				});
				if (res.ok) {
					fetchPermissions(searchQuery, activeStatus);
				}
			}
		} catch (err) {
			console.error("Clipboard copy error:", err);
			showToast("Gagal copy ke clipboard", "error");
		}
	};

	// Action: Submit Add Creator
	const handleAddCreator = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!addForm.username.trim()) {
			setAddError("Username TikTok wajib diisi");
			return;
		}

		setIsSubmittingAdd(true);
		setAddError(null);

		try {
			const cleanUsername = addForm.username.trim().replace(/^@+/, "");
			const effectiveDisplayName = addForm.displayName.trim() || cleanUsername;
			const effectiveMessage =
				addForm.customMessage.trim() ||
				generatePermissionMessage(
					effectiveDisplayName,
					addForm.targetPreset.trim(),
				);

			const payload: CreateCreatorPermissionInput = {
				platform: "tiktok",
				creator_username: cleanUsername,
				creator_display_name: effectiveDisplayName,
				target_preset_name: addForm.targetPreset.trim() || null,
				drafted_message: effectiveMessage,
			};

			const res = await fetch("/api/admin/creator-permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.error?.message || "Failed to add creator");
			}

			showToast(`Kreator @${cleanUsername} berhasil didaftarkan!`);
			setIsAddModalOpen(false);
			setAddForm({
				username: "",
				displayName: "",
				targetPreset: "",
				customMessage: "",
			});
			fetchPermissions(searchQuery, activeStatus);
		} catch (err) {
			console.error("Add creator error:", err);
			setAddError(
				err instanceof Error ? err.message : "Gagal menambah kreator",
			);
		} finally {
			setIsSubmittingAdd(false);
		}
	};

	// Action: Submit Status Change (Approve / Reject)
	const handleUpdateStatus = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedRecord) return;

		setIsSubmittingStatus(true);
		try {
			const payload: UpdateCreatorPermissionInput = {
				status: statusForm.status,
				credit_display_name: statusForm.creditDisplayName.trim() || null,
				max_allowed_presets: statusForm.maxAllowedPresets,
				notes_conditions: statusForm.notes.trim() || null,
			};

			const res = await fetch(
				`/api/admin/creator-permissions/${selectedRecord.id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);

			const json = await res.json();
			if (!res.ok) {
				throw new Error(
					json.error?.message || "Failed to update permission record",
				);
			}

			showToast(
				`Status kreator @${selectedRecord.creator_username} berhasil diubah jadi ${statusForm.status.toUpperCase()}!`,
			);
			setStatusModalType(null);
			setSelectedRecord(null);
			fetchPermissions(searchQuery, activeStatus);
		} catch (err) {
			console.error("Update status error:", err);
			showToast(
				err instanceof Error ? err.message : "Gagal update status",
				"error",
			);
		} finally {
			setIsSubmittingStatus(false);
		}
	};

	// Action: Delete
	const handleDelete = async () => {
		if (!deleteTarget) return;
		setIsDeleting(true);
		try {
			const res = await fetch(
				`/api/admin/creator-permissions/${deleteTarget.id}`,
				{
					method: "DELETE",
				},
			);
			const json = await res.json();
			if (!res.ok) {
				throw new Error(
					json.error?.message || "Failed to delete creator permission",
				);
			}

			showToast(
				`Record kreator @${deleteTarget.creator_username} berhasil dihapus.`,
			);
			setDeleteTarget(null);
			fetchPermissions(searchQuery, activeStatus);
		} catch (err) {
			console.error("Delete permission error:", err);
			showToast(
				err instanceof Error ? err.message : "Gagal menghapus record",
				"error",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Toast Banner */}
			{toast && (
				<div
					className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl transition-all animate-in fade-in slide-in-from-top-4 ${
						toast.type === "success"
							? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
							: "bg-rose-500/10 border-rose-500/20 text-rose-400"
					}`}
				>
					<div className="flex items-center gap-3">
						{toast.type === "success" ? (
							<CheckCircle2 className="w-5 h-5 shrink-0" />
						) : (
							<AlertCircle className="w-5 h-5 shrink-0" />
						)}
						<p className="text-sm font-semibold">{toast.message}</p>
					</div>
					<button
						type="button"
						onClick={() => setToast(null)}
						className="p-1 rounded-lg hover:bg-white/10"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Pipeline Stats Counters */}
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
				<button
					type="button"
					onClick={() => setActiveStatus("all")}
					className={`p-4 rounded-2xl border text-left transition-all ${
						activeStatus === "all"
							? "bg-purple-600/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
							: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
					}`}
				>
					<div className="flex items-center justify-between text-[var(--color-text-secondary)] mb-2">
						<span className="text-xs font-bold uppercase tracking-wider">
							Total Kreator
						</span>
						<Users className="w-4 h-4 text-purple-400" />
					</div>
					<div className="text-2xl font-black font-display text-white">
						{stats.total}
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveStatus("pending")}
					className={`p-4 rounded-2xl border text-left transition-all ${
						activeStatus === "pending"
							? "bg-amber-500/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
							: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
					}`}
				>
					<div className="flex items-center justify-between text-[var(--color-text-secondary)] mb-2">
						<span className="text-xs font-bold uppercase tracking-wider text-amber-300">
							Pending
						</span>
						<Clock className="w-4 h-4 text-amber-400" />
					</div>
					<div className="text-2xl font-black font-display text-amber-400">
						{stats.pending}
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveStatus("contacted")}
					className={`p-4 rounded-2xl border text-left transition-all ${
						activeStatus === "contacted"
							? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
							: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
					}`}
				>
					<div className="flex items-center justify-between text-[var(--color-text-secondary)] mb-2">
						<span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
							Contacted
						</span>
						<MessageSquare className="w-4 h-4 text-indigo-400" />
					</div>
					<div className="text-2xl font-black font-display text-indigo-400">
						{stats.contacted}
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveStatus("approved")}
					className={`p-4 rounded-2xl border text-left transition-all ${
						activeStatus === "approved"
							? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
							: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
					}`}
				>
					<div className="flex items-center justify-between text-[var(--color-text-secondary)] mb-2">
						<span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
							Approved
						</span>
						<CheckCircle2 className="w-4 h-4 text-emerald-400" />
					</div>
					<div className="text-2xl font-black font-display text-emerald-400">
						{stats.approved}
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveStatus("rejected")}
					className={`p-4 rounded-2xl border text-left transition-all ${
						activeStatus === "rejected"
							? "bg-rose-500/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
							: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
					}`}
				>
					<div className="flex items-center justify-between text-[var(--color-text-secondary)] mb-2">
						<span className="text-xs font-bold uppercase tracking-wider text-rose-300">
							Rejected
						</span>
						<XCircle className="w-4 h-4 text-rose-400" />
					</div>
					<div className="text-2xl font-black font-display text-rose-400">
						{stats.rejected}
					</div>
				</button>
			</div>

			{/* Action Toolbar */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-sm">
				{/* Search bar */}
				<div className="relative flex-1">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Cari kreator (@username, display name)..."
						className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
					/>
				</div>

				{/* Right CTA */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => fetchPermissions(searchQuery, activeStatus)}
						disabled={isLoading}
						className="p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-border-default)] transition-all active:scale-95 disabled:opacity-50"
						title="Refresh"
					>
						<RefreshCw
							className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</button>

					<button
						type="button"
						onClick={() => {
							setAddError(null);
							setIsAddModalOpen(true);
						}}
						className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-interactive-primary)] text-white text-sm font-bold shadow-lg shadow-purple-950/40 hover:opacity-95 active:scale-95 transition-all"
					>
						<Plus className="w-4 h-4" />
						<span>Tambah Kreator</span>
					</button>
				</div>
			</div>

			{/* Creator Pipeline List */}
			{isLoading && permissions.length === 0 ? (
				<div className="py-20 flex flex-col items-center justify-center space-y-3">
					<Loader2 className="w-8 h-8 animate-spin text-purple-400" />
					<p className="text-sm text-[var(--color-text-secondary)]">
						Memuat pipeline izin kreator...
					</p>
				</div>
			) : error ? (
				<div className="p-8 text-center rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-2">
					<AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
					<h3 className="font-bold text-base">Gagal memuat data</h3>
					<p className="text-xs">{error}</p>
				</div>
			) : permissions.length === 0 ? (
				<div className="p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
					<div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
						<MessageSquare className="w-6 h-6" />
					</div>
					<div className="space-y-1">
						<h3 className="font-bold text-base text-white">
							Belum ada data kreator
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
							{searchQuery || activeStatus !== "all"
								? "Tidak ada kreator yang cocok dengan filter atau kata kunci pencarian."
								: "Tambahkan kreator TikTok untuk mulai mengelola izin penggunaan preset secara terstruktur."}
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
					>
						<Plus className="w-4 h-4" />
						<span>Tambah Kreator Pertama</span>
					</button>
				</div>
			) : (
				<div className="space-y-3">
					{permissions.map((item) => {
						const isPending = item.status === "pending";
						const isContacted = item.status === "contacted";
						const isApproved = item.status === "approved";
						const isRejected = item.status === "rejected";

						return (
							<div
								key={item.id}
								className="p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all space-y-4"
							>
								{/* Header Row */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										{/* Platform Icon Badge */}
										<div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center font-bold text-sm text-purple-300 shrink-0">
											TT
										</div>

										<div>
											<div className="flex items-center gap-2">
												<h4 className="font-bold text-white text-sm sm:text-base">
													{item.creator_display_name || item.creator_username}
												</h4>
												<a
													href={item.profile_url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-0.5"
												>
													<span>@{item.creator_username}</span>
													<ExternalLink className="w-3 h-3" />
												</a>
											</div>

											<div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[var(--color-text-tertiary)]">
												<span>
													Ditambahkan:{" "}
													{new Date(item.created_at).toLocaleDateString(
														"id-ID",
														{
															day: "numeric",
															month: "short",
															year: "numeric",
														},
													)}
												</span>
												{item.contacted_at && (
													<span>
														• Di-DM:{" "}
														{new Date(item.contacted_at).toLocaleDateString(
															"id-ID",
															{
																day: "numeric",
																month: "short",
															},
														)}
													</span>
												)}
												{isApproved && (
													<span className="text-emerald-400 font-semibold">
														• Kuota Izin: {item.max_allowed_presets} preset (
														{item.used_presets_count} dipakai)
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Status Badge */}
									<div className="flex items-center gap-2 self-start sm:self-auto">
										<span
											className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
												isApproved
													? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
													: isRejected
														? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
														: isContacted
															? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
															: "bg-amber-500/15 text-amber-300 border border-amber-500/30"
											}`}
										>
											<span className="w-1.5 h-1.5 rounded-full bg-current" />
											{item.status}
										</span>
									</div>
								</div>

								{/* Message Preview Box */}
								{item.drafted_message && (
									<div className="p-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] leading-relaxed relative group">
										<div className="flex items-center justify-between mb-1.5 text-[10px] font-bold uppercase text-[var(--color-text-tertiary)] tracking-wider">
											<span className="flex items-center gap-1">
												<Sparkles className="w-3 h-3 text-purple-400" />
												Draft Pesan Izin (AI Generated)
											</span>
										</div>
										<p className="font-mono text-[11px] text-[var(--color-text-primary)]">
											{item.drafted_message}
										</p>
									</div>
								)}

								{/* Notes if any */}
								{item.notes_conditions && (
									<div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
										<span className="font-bold">Catatan/Syarat:</span>{" "}
										{item.notes_conditions}
									</div>
								)}

								{/* Action Buttons Row */}
								<div className="pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2">
									{/* Primary Workflow CTA: Copy & Open TikTok */}
									<button
										type="button"
										onClick={() => handleCopyAndOpenTikTok(item)}
										className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all active:scale-95"
									>
										{copiedId === item.id ? (
											<>
												<Check className="w-3.5 h-3.5 text-emerald-400" />
												<span className="text-emerald-400">Pesan Disalin!</span>
											</>
										) : (
											<>
												<Copy className="w-3.5 h-3.5" />
												<span>Copy Pesan & Buka TikTok</span>
												<ExternalLink className="w-3 h-3 text-purple-400 opacity-70" />
											</>
										)}
									</button>

									{/* Status Change CTA Group */}
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => {
												setSelectedRecord(item);
												setStatusForm({
													status: "approved",
													creditDisplayName:
														item.credit_display_name ||
														item.creator_display_name ||
														item.creator_username,
													maxAllowedPresets: item.max_allowed_presets || 1,
													notes: item.notes_conditions || "",
												});
												setStatusModalType("approve");
											}}
											className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95"
										>
											<CheckCircle2 className="w-3.5 h-3.5" />
											<span>Approve</span>
										</button>

										<button
											type="button"
											onClick={() => {
												setSelectedRecord(item);
												setStatusForm({
													status: "rejected",
													creditDisplayName:
														item.credit_display_name || item.creator_username,
													maxAllowedPresets: item.max_allowed_presets || 1,
													notes: item.notes_conditions || "",
												});
												setStatusModalType("reject");
											}}
											className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all active:scale-95"
										>
											<XCircle className="w-3.5 h-3.5" />
											<span>Reject</span>
										</button>

										<button
											type="button"
											onClick={() => setDeleteTarget(item)}
											className="p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
											title="Hapus record"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Modal: Tambah Kreator Baru */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
					<div className="w-full max-w-lg rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-6 shadow-2xl space-y-5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
									<UserPlus className="w-5 h-5" />
								</div>
								<div>
									<h3 className="font-bold text-base text-white">
										Tambah Kreator TikTok
									</h3>
									<p className="text-xs text-[var(--color-text-secondary)]">
										Daftarkan kreator untuk pipeline izin resmi AMHUB
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{addError && (
							<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
								{addError}
							</div>
						)}

						<form onSubmit={handleAddCreator} className="space-y-4">
							<div>
								<label
									htmlFor="add-username"
									className="block text-xs font-bold text-white mb-1.5"
								>
									Username TikTok *
								</label>
								<div className="relative">
									<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
										@
									</span>
									<input
										id="add-username"
										type="text"
										value={addForm.username}
										onChange={(e) =>
											setAddForm((prev) => ({
												...prev,
												username: e.target.value,
											}))
										}
										placeholder="contoh: colzpreset"
										required
										className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white focus:outline-none focus:border-purple-500/50"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="add-display-name"
									className="block text-xs font-bold text-white mb-1.5"
								>
									Display Name Kreator (Opsional)
								</label>
								<input
									id="add-display-name"
									type="text"
									value={addForm.displayName}
									onChange={(e) =>
										setAddForm((prev) => ({
											...prev,
											displayName: e.target.value,
										}))
									}
									placeholder="contoh: Colz | Preset AM"
									className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white focus:outline-none focus:border-purple-500/50"
								/>
							</div>

							<div>
								<label
									htmlFor="add-target-preset"
									className="block text-xs font-bold text-white mb-1.5"
								>
									Nama / Judul Preset Target (Opsional)
								</label>
								<input
									id="add-target-preset"
									type="text"
									value={addForm.targetPreset}
									onChange={(e) =>
										setAddForm((prev) => ({
											...prev,
											targetPreset: e.target.value,
										}))
									}
									placeholder="contoh: Malam Pagi Velocity / 3D Shake"
									className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white focus:outline-none focus:border-purple-500/50"
								/>
							</div>

							{/* Live AI Message Preview */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between text-xs">
									<span className="font-bold text-purple-300 flex items-center gap-1.5">
										<Sparkles className="w-3.5 h-3.5" />
										Preview Pesan Izin (Dibuat Otomatis)
									</span>
								</div>
								<div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-purple-500/20 text-xs text-[var(--color-text-primary)] font-mono leading-relaxed max-h-32 overflow-y-auto">
									{generatePermissionMessage(
										addForm.displayName || addForm.username || "kak",
										addForm.targetPreset,
									)}
								</div>
							</div>

							<div className="pt-2 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-white"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={isSubmittingAdd}
									className="px-5 py-2.5 rounded-xl bg-[var(--color-interactive-primary)] text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center gap-2"
								>
									{isSubmittingAdd && (
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
									)}
									<span>Simpan ke Pipeline</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal: Approval / Rejection Record */}
			{statusModalType && selectedRecord && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
					<div className="w-full max-w-md rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-6 shadow-2xl space-y-5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{statusModalType === "approve" ? (
									<div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
										<CheckCircle2 className="w-5 h-5" />
									</div>
								) : (
									<div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
										<XCircle className="w-5 h-5" />
									</div>
								)}
								<div>
									<h3 className="font-bold text-base text-white">
										{statusModalType === "approve"
											? "Catat Persetujuan (Approved)"
											: "Catat Penolakan (Rejected)"}
									</h3>
									<p className="text-xs text-[var(--color-text-secondary)]">
										Kreator: @{selectedRecord.creator_username}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setStatusModalType(null)}
								className="p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleUpdateStatus} className="space-y-4">
							{statusModalType === "approve" && (
								<>
									<div>
										<label
											htmlFor="status-credit-name"
											className="block text-xs font-bold text-white mb-1.5"
										>
											Nama Credit yang Wajib Dicantumkan
										</label>
										<input
											id="status-credit-name"
											type="text"
											value={statusForm.creditDisplayName}
											onChange={(e) =>
												setStatusForm((prev) => ({
													...prev,
													creditDisplayName: e.target.value,
												}))
											}
											placeholder="contoh: @colzpreset"
											className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white focus:outline-none focus:border-emerald-500/50"
										/>
									</div>

									<div>
										<label
											htmlFor="status-max-presets"
											className="block text-xs font-bold text-white mb-1.5"
										>
											Maksimal Preset yang Diizinkan (Kuota)
										</label>
										<input
											id="status-max-presets"
											type="number"
											min={1}
											max={50}
											value={statusForm.maxAllowedPresets}
											onChange={(e) =>
												setStatusForm((prev) => ({
													...prev,
													maxAllowedPresets: Number(e.target.value) || 1,
												}))
											}
											className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white focus:outline-none focus:border-emerald-500/50"
										/>
									</div>
								</>
							)}

							<div>
								<label
									htmlFor="status-notes"
									className="block text-xs font-bold text-white mb-1.5"
								>
									Catatan / Syarat Khusus Kreator
								</label>
								<textarea
									id="status-notes"
									rows={3}
									value={statusForm.notes}
									onChange={(e) =>
										setStatusForm((prev) => ({
											...prev,
											notes: e.target.value,
										}))
									}
									placeholder={
										statusModalType === "approve"
											? "contoh: 'Boleh ambil 2 preset video terbaru aja ya kak'"
											: "contoh: 'Kreator tidak bersedia presetnya dipasang di luar TikTok'"
									}
									className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-white focus:outline-none focus:border-purple-500/50"
								/>
							</div>

							<div className="pt-2 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setStatusModalType(null)}
									className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-white"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={isSubmittingStatus}
									className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
										statusModalType === "approve"
											? "bg-emerald-600 hover:bg-emerald-500"
											: "bg-rose-600 hover:bg-rose-500"
									}`}
								>
									{isSubmittingStatus && (
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
									)}
									<span>Simpan Status</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
					<div className="w-full max-w-sm rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-6 shadow-2xl space-y-4">
						<div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
							<Trash2 className="w-6 h-6" />
						</div>
						<div className="text-center space-y-1">
							<h3 className="font-bold text-base text-white">
								Hapus Record Kreator?
							</h3>
							<p className="text-xs text-[var(--color-text-secondary)]">
								Record izin untuk @{deleteTarget.creator_username} akan dihapus
								dari pipeline outreach.
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 pt-2">
							<button
								type="button"
								onClick={() => setDeleteTarget(null)}
								disabled={isDeleting}
								className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-white"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={isDeleting}
								className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
							>
								{isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
								<span>Ya, Hapus</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
