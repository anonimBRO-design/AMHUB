"use client";

import {
	AlertCircle,
	ArrowDownToLine,
	Banknote,
	Check,
	CheckCircle2,
	Clock,
	Copy,
	CreditCard,
	ExternalLink,
	Filter,
	Loader2,
	RefreshCw,
	ShieldAlert,
	User,
	X,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

interface AdminWithdrawalItem {
	id: string;
	creator_id: string;
	amount: number;
	currency: string;
	payment_method: string;
	account_name: string;
	account_number: string;
	status: "pending" | "processing" | "completed" | "rejected";
	rejection_reason?: string | null;
	created_at: string;
	processed_at?: string | null;
	creator?: {
		id: string;
		username: string;
		display_name: string;
		avatar_url?: string | null;
	} | null;
}

export function WithdrawalsAdminTab() {
	const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Action dialog
	const [selectedAction, setSelectedAction] = useState<{
		item: AdminWithdrawalItem;
		status: "processing" | "completed" | "rejected";
	} | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchWithdrawals = useCallback(
		async (silent = false) => {
			if (!silent) setIsLoading(true);
			else setIsRefreshing(true);

			try {
				const params = new URLSearchParams();
				if (statusFilter !== "all") params.set("status", statusFilter);

				const res = await fetch(`/api/admin/withdrawals?${params.toString()}`);
				const json = await res.json().catch(() => ({}));
				if (!res.ok) {
					throw new Error(
						json.error?.message ||
							`[HTTP ${res.status}] Gagal memuat antrean penarikan saldo`,
					);
				}
				setWithdrawals(json.data || []);
			} catch (err) {
				const msg =
					err instanceof Error ? err.message : "Gagal memuat withdrawals";
				setToast({ type: "error", message: msg });
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[statusFilter],
	);

	useEffect(() => {
		fetchWithdrawals();
	}, [fetchWithdrawals]);

	const handleCopy = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleUpdateStatus = async () => {
		if (!selectedAction) return;
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/admin/withdrawals", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: selectedAction.item.id,
					status: selectedAction.status,
					rejection_reason:
						selectedAction.status === "rejected"
							? rejectionReason.trim() || "Ditolak oleh admin"
							: undefined,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(
					data?.error?.message || "Gagal memperbarui status penarikan",
				);
			}

			setToast({
				type: "success",
				message: `Status penarikan Rp ${selectedAction.item.amount.toLocaleString("id-ID")} diubah menjadi ${selectedAction.status}!`,
			});
			setSelectedAction(null);
			setRejectionReason("");
			fetchWithdrawals(true);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal memproses penarikan";
			setToast({ type: "error", message: msg });
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStatusBadge = (status: AdminWithdrawalItem["status"]) => {
		switch (status) {
			case "completed":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						<CheckCircle2 className="w-3 h-3" /> Selesai
					</span>
				);
			case "processing":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
						<Loader2 className="w-3 h-3 animate-spin" /> Sedang Ditransfer
					</span>
				);
			case "rejected":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
						<XCircle className="w-3 h-3" /> Ditolak
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
						<Clock className="w-3 h-3" /> Menunggu Review
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

			{/* Filter & Refresh */}
			<div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-between gap-4">
				<div className="flex items-center gap-1.5 overflow-x-auto">
					{["all", "pending", "processing", "completed", "rejected"].map(
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
								{status === "all" ? "Semua Permintaan" : status}
							</button>
						),
					)}
				</div>

				<button
					type="button"
					onClick={() => fetchWithdrawals(true)}
					disabled={isLoading || isRefreshing}
					className="p-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:text-white text-[var(--color-text-secondary)]"
					title="Refresh data"
				>
					<RefreshCw
						className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
					/>
				</button>
			</div>

			{/* Withdrawals Table */}
			<div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Banknote className="w-5 h-5 text-cyan-400" />
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							Pencairan Saldo & Payout Creator
						</h3>
					</div>
					<span className="text-xs text-[var(--color-text-secondary)]">
						{withdrawals.length} Permintaan
					</span>
				</div>

				{isLoading ? (
					<div className="py-16 flex flex-col items-center justify-center gap-2 text-[var(--color-text-secondary)]">
						<Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
						<p className="text-xs">Memuat antrean penarikan dana...</p>
					</div>
				) : withdrawals.length === 0 ? (
					<div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
						Belum ada permintaan penarikan dana pada status ini.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] uppercase font-semibold">
									<th className="py-3 px-3">Tanggal</th>
									<th className="py-3 px-3">Creator</th>
									<th className="py-3 px-3">Nominal</th>
									<th className="py-3 px-3">Metode & Rekening Tujuan</th>
									<th className="py-3 px-3">Status</th>
									<th className="py-3 px-3 text-right">Aksi Payout</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--color-border-subtle)]">
								{withdrawals.map((item) => (
									<tr
										key={item.id}
										className="hover:bg-[var(--color-bg-elevated)] transition-colors"
									>
										{/* Tanggal */}
										<td className="py-3 px-3 text-[var(--color-text-secondary)] whitespace-nowrap">
											{new Date(item.created_at).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>

										{/* Creator */}
										<td className="py-3 px-3">
											{item.creator ? (
												<Link
													href={`/u/${item.creator.username}`}
													target="_blank"
													className="font-bold text-[var(--color-text-primary)] hover:text-cyan-400 transition-colors flex items-center gap-1"
												>
													<span>@{item.creator.username}</span>
													<ExternalLink className="w-3 h-3 opacity-60" />
												</Link>
											) : (
												<span className="text-[var(--color-text-tertiary)]">
													Unknown
												</span>
											)}
										</td>

										{/* Nominal */}
										<td className="py-3 px-3 font-bold text-white whitespace-nowrap">
											Rp {item.amount.toLocaleString("id-ID")}
										</td>

										{/* Metode & Rekening */}
										<td className="py-3 px-3">
											<div className="font-bold uppercase text-[11px] text-cyan-300">
												{item.payment_method}
											</div>
											<div className="text-[11px] text-[var(--color-text-primary)] flex items-center gap-1.5 mt-0.5">
												<span>
													{item.account_name} ({item.account_number})
												</span>
												<button
													type="button"
													onClick={() =>
														handleCopy(item.account_number, item.id)
													}
													className="text-[var(--color-text-tertiary)] hover:text-white"
													title="Salin nomor"
												>
													{copiedId === item.id ? (
														<Check className="w-3 h-3 text-emerald-400" />
													) : (
														<Copy className="w-3 h-3" />
													)}
												</button>
											</div>
										</td>

										{/* Status */}
										<td className="py-3 px-3 whitespace-nowrap">
											{getStatusBadge(item.status)}
											{item.status === "rejected" && item.rejection_reason && (
												<div className="text-[10px] text-rose-400 mt-1 max-w-[160px] truncate">
													Alasan: {item.rejection_reason}
												</div>
											)}
										</td>

										{/* Aksi */}
										<td className="py-3 px-3 text-right whitespace-nowrap">
											<div className="inline-flex items-center gap-1.5">
												{item.status === "pending" && (
													<button
														type="button"
														onClick={() =>
															setSelectedAction({
																item,
																status: "processing",
															})
														}
														className="px-2.5 py-1 rounded-lg text-xs font-bold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 transition-colors"
													>
														Proses
													</button>
												)}

												{item.status !== "completed" && (
													<button
														type="button"
														onClick={() =>
															setSelectedAction({
																item,
																status: "completed",
															})
														}
														className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
													>
														Transfer Selesai
													</button>
												)}

												{item.status !== "rejected" && (
													<button
														type="button"
														onClick={() =>
															setSelectedAction({
																item,
																status: "rejected",
															})
														}
														className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
													>
														Tolak
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

			{/* Status Action Confirmation Modal */}
			{selectedAction && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="w-full max-w-md rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-bold text-[var(--color-text-primary)]">
								{selectedAction.status === "completed"
									? "Konfirmasi Transfer Selesai"
									: selectedAction.status === "processing"
										? "Proses Penarikan Dana"
										: "Tolak Penarikan Saldo"}
							</h3>
							<button
								type="button"
								onClick={() => setSelectedAction(null)}
								className="p-1 text-[var(--color-text-tertiary)] hover:text-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] space-y-1.5 text-xs">
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">
									Nominal Transfer:
								</span>
								<span className="font-bold text-white">
									Rp {selectedAction.item.amount.toLocaleString("id-ID")}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">
									Tujuan:
								</span>
								<span className="font-semibold text-cyan-300 uppercase">
									{selectedAction.item.payment_method} •{" "}
									{selectedAction.item.account_number}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">
									Atas Nama:
								</span>
								<span className="font-medium text-[var(--color-text-primary)]">
									{selectedAction.item.account_name}
								</span>
							</div>
						</div>

						{selectedAction.status === "rejected" && (
							<div>
								<label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
									Alasan Penolakan:
								</label>
								<textarea
									rows={2}
									placeholder="Contoh: Nomor e-wallet tidak aktif atau nama tidak sesuai rekening."
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-rose-500"
								/>
							</div>
						)}

						<div className="flex items-center justify-end gap-2 pt-2">
							<button
								type="button"
								onClick={() => setSelectedAction(null)}
								className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleUpdateStatus}
								disabled={isSubmitting}
								className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 ${
									selectedAction.status === "completed"
										? "bg-emerald-600 hover:bg-emerald-500"
										: selectedAction.status === "processing"
											? "bg-sky-600 hover:bg-sky-500"
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
