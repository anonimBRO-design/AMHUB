"use client";

import {
	AlertCircle,
	ArrowDownToLine,
	Building2,
	CheckCircle2,
	Clock,
	Coins,
	CreditCard,
	History,
	Loader2,
	RefreshCw,
	ShieldCheck,
	Smartphone,
	Wallet,
	X,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

export type WithdrawalMethod =
	| "dana"
	| "gopay"
	| "ovo"
	| "bca"
	| "bri"
	| "mandiri";

export interface CreatorBalance {
	totalEarnings: number;
	totalWithdrawn: number;
	availableBalance: number;
	currency: string;
}

export interface CreatorWithdrawalItem {
	id: string;
	amount: number;
	currency: string;
	payment_method: WithdrawalMethod;
	account_name: string;
	account_number: string;
	status: "pending" | "processing" | "completed" | "rejected";
	rejection_reason?: string | null;
	created_at: string;
	processed_at?: string | null;
}

const PAYMENT_METHODS: {
	id: WithdrawalMethod;
	name: string;
	type: "ewallet" | "bank";
	icon: string;
}[] = [
	{ id: "dana", name: "DANA", type: "ewallet", icon: "📱" },
	{ id: "gopay", name: "GoPay", type: "ewallet", icon: "🟢" },
	{ id: "ovo", name: "OVO", type: "ewallet", icon: "🟣" },
	{ id: "bca", name: "BCA", type: "bank", icon: "🏦" },
	{ id: "mandiri", name: "Bank Mandiri", type: "bank", icon: "🏦" },
	{ id: "bri", name: "BRI", type: "bank", icon: "🏦" },
];

export function CreatorWallet() {
	const [balance, setBalance] = useState<CreatorBalance>({
		totalEarnings: 0,
		totalWithdrawn: 0,
		availableBalance: 0,
		currency: "IDR",
	});
	const [withdrawals, setWithdrawals] = useState<CreatorWithdrawalItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);

	// Form inputs
	const [amount, setAmount] = useState<number>(20000);
	const [paymentMethod, setPaymentMethod] = useState<WithdrawalMethod>("dana");
	const [accountName, setAccountName] = useState("");
	const [accountNumber, setAccountNumber] = useState("");

	const fetchWalletData = useCallback(async (isSilent = false) => {
		if (!isSilent) setIsLoading(true);
		else setIsRefreshing(true);
		setError(null);

		try {
			const res = await fetch("/api/creators/withdrawals");
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data?.error?.message || "Gagal memuat data dompet.");
			}
			const json = await res.json();
			if (json.data) {
				setBalance(json.data.balance);
				setWithdrawals(json.data.withdrawals || []);
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
			setError(msg);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchWalletData();
	}, [fetchWalletData]);

	const handleOpenModal = () => {
		setFormError(null);
		setFormSuccess(null);
		// Default amount to min 20k or max available if less
		setAmount(Math.min(20000, balance.availableBalance || 20000));
		setIsModalOpen(true);
	};

	const handleSubmitWithdrawal = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		setFormSuccess(null);

		if (amount < 20000) {
			setFormError("Minimum penarikan saldo adalah Rp 20.000");
			return;
		}

		if (amount > balance.availableBalance) {
			setFormError(
				`Saldo tidak mencukupi. Saldo tersedia: Rp ${balance.availableBalance.toLocaleString("id-ID")}`,
			);
			return;
		}

		if (!accountName.trim() || accountName.trim().length < 2) {
			setFormError("Nama pemilik akun/rekening harus diisi (min. 2 karakter)");
			return;
		}

		if (!accountNumber.trim() || accountNumber.trim().length < 5) {
			setFormError(
				"Nomor HP e-wallet atau rekening tidak valid (min. 5 digit)",
			);
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/creators/withdrawals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount,
					payment_method: paymentMethod,
					account_name: accountName.trim(),
					account_number: accountNumber.trim(),
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(
					data?.error?.message || "Gagal memproses penarikan saldo.",
				);
			}

			setFormSuccess(
				"Permintaan penarikan berhasil dikirim! Admin akan memproses transfer.",
			);
			setTimeout(() => {
				setIsModalOpen(false);
				fetchWalletData(true);
			}, 1500);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal mengajukan penarikan";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStatusBadge = (status: CreatorWithdrawalItem["status"]) => {
		switch (status) {
			case "completed":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						<CheckCircle2 className="w-3.5 h-3.5" /> Selesai
					</span>
				);
			case "processing":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
						<Loader2 className="w-3.5 h-3.5 animate-spin" /> Sedang Ditransfer
					</span>
				);
			case "rejected":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
						<XCircle className="w-3.5 h-3.5" /> Ditolak
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
						<Clock className="w-3.5 h-3.5" /> Menunggu Review
					</span>
				);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] relative overflow-hidden">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600/20 to-fuchsia-600/20 text-cyan-400 border border-cyan-500/30">
							<Wallet className="w-6 h-6" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
									Dompet & Penghasilan Creator
								</h3>
								<span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
									90% SHARE
								</span>
							</div>
							<p className="text-xs text-[var(--color-text-secondary)]">
								Tarik saldo penjualan preset langsung ke DANA, GoPay, OVO, atau
								Bank lokal.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => fetchWalletData(true)}
							disabled={isLoading || isRefreshing}
							className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors disabled:opacity-50"
							title="Refresh data"
						>
							<RefreshCw
								className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
							/>
						</button>
						<button
							type="button"
							onClick={handleOpenModal}
							disabled={balance.availableBalance < 20000}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							<ArrowDownToLine className="w-4 h-4" />
							Tarik Saldo
						</button>
					</div>
				</div>

				{/* Balance Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
					{/* Available Balance */}
					<div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 to-cyan-950/20 border border-cyan-500/20">
						<div className="flex items-center justify-between text-xs text-cyan-300 font-medium">
							<span>Saldo Siap Tarik</span>
							<Coins className="w-4 h-4 text-cyan-400" />
						</div>
						<div className="mt-2 text-2xl font-black text-white tracking-tight">
							Rp {balance.availableBalance.toLocaleString("id-ID")}
						</div>
						<div className="mt-1 text-[11px] text-cyan-300/70">
							{balance.availableBalance >= 20000
								? "Dapat dicairkan sekarang"
								: "Min. penarikan Rp 20.000"}
						</div>
					</div>

					{/* Total Earnings */}
					<div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
						<div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
							<span>Total Penjualan Bersih</span>
							<ShieldCheck className="w-4 h-4 text-emerald-400" />
						</div>
						<div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
							Rp {balance.totalEarnings.toLocaleString("id-ID")}
						</div>
						<div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
							Akumulasi 90% payout preset
						</div>
					</div>

					{/* Total Withdrawn */}
					<div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
						<div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
							<span>Total Sudah Dicairkan</span>
							<CheckCircle2 className="w-4 h-4 text-sky-400" />
						</div>
						<div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
							Rp {balance.totalWithdrawn.toLocaleString("id-ID")}
						</div>
						<div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
							Dana berhasil ditransfer
						</div>
					</div>
				</div>
			</div>

			{/* Withdrawal History Table */}
			<div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-base font-bold text-[var(--color-text-primary)]">
						<History className="w-4 h-4 text-cyan-400" />
						<h4>Riwayat Penarikan Dana</h4>
					</div>
					<span className="text-xs text-[var(--color-text-secondary)]">
						{withdrawals.length} Transaksi
					</span>
				</div>

				{isLoading ? (
					<div className="py-12 flex flex-col items-center justify-center gap-2 text-[var(--color-text-secondary)]">
						<Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
						<p className="text-xs">Memuat data penarikan...</p>
					</div>
				) : withdrawals.length === 0 ? (
					<div className="py-10 text-center text-xs text-[var(--color-text-secondary)]">
						Belum ada riwayat penarikan dana. Saldo penjualan presetmu akan
						muncul di sini saat dicairkan!
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] uppercase font-semibold">
									<th className="py-2.5 px-3">Tanggal</th>
									<th className="py-2.5 px-3">Metode & Akun</th>
									<th className="py-2.5 px-3">Jumlah</th>
									<th className="py-2.5 px-3 text-right">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--color-border-subtle)]">
								{withdrawals.map((w) => (
									<tr
										key={w.id}
										className="hover:bg-[var(--color-bg-elevated)] transition-colors"
									>
										<td className="py-3 px-3 text-[var(--color-text-secondary)] whitespace-nowrap">
											{new Date(w.created_at).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>
										<td className="py-3 px-3 text-[var(--color-text-primary)]">
											<div className="font-semibold uppercase tracking-wider text-[11px] text-cyan-300">
												{w.payment_method}
											</div>
											<div className="text-[var(--color-text-secondary)] text-[11px]">
												{w.account_name} • {w.account_number}
											</div>
										</td>
										<td className="py-3 px-3 font-bold text-[var(--color-text-primary)]">
											Rp {w.amount.toLocaleString("id-ID")}
										</td>
										<td className="py-3 px-3 text-right whitespace-nowrap">
											{getStatusBadge(w.status)}
											{w.status === "rejected" && w.rejection_reason && (
												<div className="text-[10px] text-rose-400 mt-1">
													Ket: {w.rejection_reason}
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Modal Tarik Saldo */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="w-full max-w-md rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl overflow-hidden p-6 space-y-5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400">
									<ArrowDownToLine className="w-5 h-5" />
								</div>
								<h3 className="text-base font-bold text-[var(--color-text-primary)]">
									Tarik Saldo Creator
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{formError && (
							<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
								<AlertCircle className="w-4 h-4 shrink-0" />
								<span>{formError}</span>
							</div>
						)}

						{formSuccess && (
							<div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs">
								<CheckCircle2 className="w-4 h-4 shrink-0" />
								<span>{formSuccess}</span>
							</div>
						)}

						<form onSubmit={handleSubmitWithdrawal} className="space-y-4">
							{/* Jumlah Penarikan */}
							<div>
								<div className="flex items-center justify-between text-xs mb-1.5">
									<label className="font-semibold text-[var(--color-text-primary)]">
										Jumlah Penarikan (IDR)
									</label>
									<span className="text-[var(--color-text-secondary)]">
										Tersedia: Rp{" "}
										{balance.availableBalance.toLocaleString("id-ID")}
									</span>
								</div>
								<div className="relative">
									<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-tertiary)]">
										Rp
									</span>
									<input
										type="number"
										min={20000}
										max={balance.availableBalance}
										step={5000}
										value={amount}
										onChange={(e) => setAmount(Number(e.target.value))}
										className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-500"
										required
									/>
								</div>
								{/* Quick Select Buttons */}
								<div className="flex items-center gap-1.5 mt-2 flex-wrap">
									{[20000, 50000, 100000].map((val) => (
										<button
											key={val}
											type="button"
											onClick={() =>
												setAmount(Math.min(val, balance.availableBalance))
											}
											className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
												amount === val
													? "bg-cyan-600 text-white"
													: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
											}`}
										>
											Rp {val.toLocaleString("id-ID")}
										</button>
									))}
									<button
										type="button"
										onClick={() => setAmount(balance.availableBalance)}
										className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
									>
										Tarik Semua
									</button>
								</div>
							</div>

							{/* Metode Pembayaran */}
							<div>
								<label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
									Pilih Metode Transfer
								</label>
								<div className="grid grid-cols-3 gap-2">
									{PAYMENT_METHODS.map((method) => (
										<button
											key={method.id}
											type="button"
											onClick={() => setPaymentMethod(method.id)}
											className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center gap-1 ${
												paymentMethod === method.id
													? "border-cyan-500 bg-cyan-500/10 text-white shadow-sm"
													: "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]"
											}`}
										>
											<span className="text-base">{method.icon}</span>
											<span className="text-xs font-bold">{method.name}</span>
										</button>
									))}
								</div>
							</div>

							{/* Nama Rekening / Akun */}
							<div>
								<label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
									Nama Pemilik Akun / Rekening
								</label>
								<input
									type="text"
									placeholder="Contoh: Budi Santoso"
									value={accountName}
									onChange={(e) => setAccountName(e.target.value)}
									className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-500"
									required
								/>
							</div>

							{/* Nomor Rekening / No HP */}
							<div>
								<label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
									Nomor HP E-Wallet / Nomor Rekening
								</label>
								<input
									type="text"
									placeholder="Contoh: 081234567890 atau 1234567890"
									value={accountNumber}
									onChange={(e) => setAccountNumber(e.target.value)}
									className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-500 font-mono"
									required
								/>
							</div>

							{/* Submit Button */}
							<div className="pt-2">
								<button
									type="submit"
									disabled={isSubmitting || !!formSuccess}
									className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Memproses Permintaan...
										</>
									) : (
										<>
											<ArrowDownToLine className="w-4 h-4" />
											Ajukan Penarikan (Rp {amount.toLocaleString("id-ID")})
										</>
									)}
								</button>
								<p className="text-[10px] text-center text-[var(--color-text-tertiary)] mt-2">
									Penarikan diproses oleh admin dalam 1x24 jam hari kerja.
								</p>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
