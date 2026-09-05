"use client";

import {
	AlertCircle,
	ArrowRight,
	Check,
	CheckCircle2,
	Clock,
	Copy,
	CreditCard,
	Download,
	ExternalLink,
	Loader2,
	Lock,
	QrCode,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export interface PresetOrderItem {
	id: string;
	order_number: string;
	preset_id: string;
	gross_amount: number;
	currency: string;
	payment_provider: string;
	payment_status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
	created_at: string;
}

interface PresetPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	preset: {
		id: string;
		title: string;
		price: number;
		currency?: string;
	};
	initialOrder?: PresetOrderItem | null;
	onPaymentSuccess: () => void;
}

export function PresetPaymentModal({
	isOpen,
	onClose,
	preset,
	initialOrder,
	onPaymentSuccess,
}: PresetPaymentModalProps) {
	const [order, setOrder] = useState<PresetOrderItem | null>(
		initialOrder || null,
	);
	const [selectedMethod, setSelectedMethod] = useState<"qris" | "transfer">(
		"qris",
	);
	const [isCheckingStatus, setIsCheckingStatus] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const [copiedNumber, setCopiedNumber] = useState(false);
	const [copiedOrderNo, setCopiedOrderNo] = useState(false);

	// Poll order status when modal is open and order is pending
	const checkPaymentStatus = useCallback(async () => {
		if (!order?.id || isSuccess) return;
		setIsCheckingStatus(true);
		setStatusMessage(null);

		try {
			const res = await fetch(`/api/orders/${order.id}`);
			if (!res.ok) throw new Error("Gagal memeriksa status order");
			const json = await res.json();
			const currentOrder = json?.data as PresetOrderItem;

			if (currentOrder) {
				setOrder(currentOrder);
				if (currentOrder.payment_status === "paid") {
					setIsSuccess(true);
					setStatusMessage("Pembayaran berhasil diverifikasi!");
					setTimeout(() => {
						onPaymentSuccess();
					}, 1800);
				} else {
					setStatusMessage("Menunggu pembayaran diselesaikan.");
				}
			}
		} catch (err) {
			setStatusMessage("Belum mendeteksi pembayaran. Coba lagi beberapa saat.");
		} finally {
			setIsCheckingStatus(false);
		}
	}, [order?.id, isSuccess, onPaymentSuccess]);

	useEffect(() => {
		if (!isOpen || !order?.id || isSuccess) return;

		// Initial check
		const timer = setInterval(() => {
			checkPaymentStatus();
		}, 6000);

		return () => clearInterval(timer);
	}, [isOpen, order?.id, isSuccess, checkPaymentStatus]);

	if (!isOpen) return null;

	const handleCopy = (text: string, type: "order" | "va") => {
		navigator.clipboard.writeText(text);
		if (type === "order") {
			setCopiedOrderNo(true);
			setTimeout(() => setCopiedOrderNo(false), 2000);
		} else {
			setCopiedNumber(true);
			setTimeout(() => setCopiedNumber(false), 2000);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="w-full max-w-md rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl overflow-hidden p-6 space-y-5 relative">
				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
							<ShieldCheck className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base font-bold text-[var(--color-text-primary)]">
								Checkout Preset
							</h3>
							<p className="text-xs text-[var(--color-text-secondary)]">
								Selesaikan pembayaran untuk membuka link & file preset
							</p>
						</div>
					</div>
				</div>

				{/* Order Summary Card */}
				<div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] space-y-2.5">
					<div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
						<span className="truncate max-w-[200px] font-medium text-[var(--color-text-primary)]">
							{preset.title}
						</span>
						<span className="font-bold text-cyan-400">
							Rp {preset.price.toLocaleString("id-ID")}
						</span>
					</div>

					{order && (
						<div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px]">
							<span className="text-[var(--color-text-tertiary)]">
								No. Order:
							</span>
							<button
								type="button"
								onClick={() => handleCopy(order.order_number, "order")}
								className="flex items-center gap-1 font-mono font-bold text-[var(--color-text-secondary)] hover:text-white"
							>
								<span>{order.order_number}</span>
								{copiedOrderNo ? (
									<Check className="w-3 h-3 text-emerald-400" />
								) : (
									<Copy className="w-3 h-3" />
								)}
							</button>
						</div>
					)}
				</div>

				{/* Success State */}
				{isSuccess ? (
					<div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
						<div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
							<CheckCircle2 className="w-8 h-8" />
						</div>
						<div>
							<h4 className="text-base font-bold text-white">
								Pembayaran Berhasil!
							</h4>
							<p className="text-xs text-[var(--color-text-secondary)] mt-1">
								Preset langsung terbuka dan siap kamu unduh / import sekarang.
							</p>
						</div>
						<div className="pt-2">
							<button
								type="button"
								onClick={onPaymentSuccess}
								className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5"
							>
								<Download className="w-4 h-4" />
								Buka & Download Preset
							</button>
						</div>
					</div>
				) : (
					<>
						{/* Payment Method Selector */}
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setSelectedMethod("qris")}
								className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
									selectedMethod === "qris"
										? "border-cyan-500 bg-cyan-500/15 text-white shadow-sm"
										: "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]"
								}`}
							>
								<QrCode className="w-4 h-4 text-cyan-400" />
								QRIS (Semua E-Wallet)
							</button>
							<button
								type="button"
								onClick={() => setSelectedMethod("transfer")}
								className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
									selectedMethod === "transfer"
										? "border-cyan-500 bg-cyan-500/10 text-white shadow-sm"
										: "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]"
								}`}
							>
								<CreditCard className="w-4 h-4 text-cyan-400" />
								Manual / Bank
							</button>
						</div>

						{/* Method Content */}
						{selectedMethod === "qris" ? (
							<div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex flex-col items-center text-center space-y-3">
								<div className="p-3 bg-white rounded-xl shadow-md border border-neutral-200">
									{/* Modern Simulated Dynamic QRIS SVG */}
									<svg
										className="w-44 h-44"
										viewBox="0 0 100 100"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										{/* Finder patterns */}
										<rect
											x="5"
											y="5"
											width="26"
											height="26"
											rx="4"
											fill="#000"
										/>
										<rect
											x="9"
											y="9"
											width="18"
											height="18"
											rx="2"
											fill="#fff"
										/>
										<rect x="13" y="13" width="10" height="10" fill="#000" />

										<rect
											x="69"
											y="5"
											width="26"
											height="26"
											rx="4"
											fill="#000"
										/>
										<rect
											x="73"
											y="9"
											width="18"
											height="18"
											rx="2"
											fill="#fff"
										/>
										<rect x="77" y="13" width="10" height="10" fill="#000" />

										<rect
											x="5"
											y="69"
											width="26"
											height="26"
											rx="4"
											fill="#000"
										/>
										<rect
											x="9"
											y="73"
											width="18"
											height="18"
											rx="2"
											fill="#fff"
										/>
										<rect x="13" y="77" width="10" height="10" fill="#000" />

										{/* Data patterns */}
										<rect x="36" y="8" width="6" height="6" fill="#000" />
										<rect x="46" y="8" width="6" height="6" fill="#000" />
										<rect x="56" y="8" width="6" height="6" fill="#000" />
										<rect x="36" y="18" width="6" height="6" fill="#000" />
										<rect x="48" y="24" width="6" height="6" fill="#000" />

										<rect x="8" y="38" width="6" height="6" fill="#000" />
										<rect x="18" y="44" width="6" height="6" fill="#000" />
										<rect x="24" y="38" width="6" height="6" fill="#000" />

										<rect
											x="36"
											y="36"
											width="28"
											height="28"
											rx="4"
											fill="#00C8FF"
										/>
										<path
											d="M44 50L48 54L56 44"
											stroke="#fff"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>

										<rect x="70" y="38" width="6" height="6" fill="#000" />
										<rect x="80" y="44" width="6" height="6" fill="#000" />
										<rect x="76" y="56" width="6" height="6" fill="#000" />

										<rect x="36" y="72" width="6" height="6" fill="#000" />
										<rect x="48" y="82" width="6" height="6" fill="#000" />
										<rect x="60" y="72" width="6" height="6" fill="#000" />
										<rect x="72" y="80" width="6" height="6" fill="#000" />
										<rect x="84" y="72" width="6" height="6" fill="#000" />
									</svg>
								</div>
								<div className="space-y-1">
									<div className="text-xs font-bold text-[var(--color-text-primary)]">
										Scan via QRIS Nasional
									</div>
									<p className="text-[11px] text-[var(--color-text-secondary)]">
										Buka GoPay, OVO, DANA, BCA Mobile, Livin', atau ShopeePay
									</p>
								</div>
							</div>
						) : (
							<div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] space-y-3 text-xs">
								<div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
									<span className="text-[var(--color-text-secondary)]">
										Bank Transfer:
									</span>
									<span className="font-bold text-[var(--color-text-primary)]">
										BCA / Mandiri
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[var(--color-text-secondary)]">
										Nomor Rekening:
									</span>
									<button
										type="button"
										onClick={() => handleCopy("8870812345678", "va")}
										className="flex items-center gap-1 font-mono font-bold text-cyan-400 hover:underline"
									>
										<span>8870812345678</span>
										{copiedNumber ? (
											<Check className="w-3 h-3 text-emerald-400" />
										) : (
											<Copy className="w-3 h-3" />
										)}
									</button>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[var(--color-text-secondary)]">
										Atas Nama:
									</span>
									<span className="font-semibold text-[var(--color-text-primary)]">
										AMHUB INDONESIA
									</span>
								</div>
								<p className="text-[10px] text-[var(--color-text-tertiary)] pt-1">
									Pastikan nominal transfer sesuai:{" "}
									<strong>Rp {preset.price.toLocaleString("id-ID")}</strong>
								</p>
							</div>
						)}

						{/* Status feedback & check button */}
						{statusMessage && (
							<div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
								<Clock className="w-3.5 h-3.5" />
								<span>{statusMessage}</span>
							</div>
						)}

						<div className="space-y-2 pt-1">
							<button
								type="button"
								onClick={checkPaymentStatus}
								disabled={isCheckingStatus}
								className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
							>
								{isCheckingStatus ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Mengecek Pembayaran...
									</>
								) : (
									<>
										<RefreshCw className="w-4 h-4" />
										Cek Status Pembayaran
									</>
								)}
							</button>

							<p className="text-[10px] text-center text-[var(--color-text-tertiary)]">
								Otomatis mendeteksi status pembayaran dalam hitungan detik.
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
