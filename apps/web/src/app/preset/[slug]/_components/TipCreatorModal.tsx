"use client";

import { useLanguage } from "@/i18n";
import {
	CheckCircle2,
	Coffee,
	Heart,
	Loader2,
	QrCode,
	Sparkles,
	X,
} from "lucide-react";
import React, { useState } from "react";

interface TipCreatorModalProps {
	isOpen: boolean;
	onClose: () => void;
	creator: {
		username: string;
		displayName: string;
		avatarUrl?: string | null;
	};
}

const TIP_TIERS = [
	{ amount: 2000, labelKey: "tipAmountEsTeh", icon: "🧋" },
	{ amount: 5000, labelKey: "tipAmountKopi", icon: "☕" },
	{ amount: 10000, labelKey: "tipAmountMakan", icon: "🍱" },
] as const;

export function TipCreatorModal({
	isOpen,
	onClose,
	creator,
}: TipCreatorModalProps) {
	const { t, language } = useLanguage();
	const [selectedAmount, setSelectedAmount] = useState<number>(2000);
	const [customAmount, setCustomAmount] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [step, setStep] = useState<"select" | "qris" | "success">("select");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) return null;

	const finalAmount =
		customAmount && parseInt(customAmount, 10) >= 1000
			? parseInt(customAmount, 10)
			: selectedAmount;

	const handleProceedToQris = () => {
		setIsSubmitting(true);
		setTimeout(() => {
			setIsSubmitting(false);
			setStep("qris");
		}, 600);
	};

	const handleSimulatedPaymentSuccess = () => {
		setStep("success");
		setTimeout(() => {
			setStep("select");
			onClose();
		}, 2500);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={() => onClose()}
		>
			<div
				className="w-full max-w-md rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl p-6 space-y-5 relative"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-white hover:bg-[var(--color-bg-elevated)] transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
						<Coffee className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							{t.presetDetail.tipCreatorTitle} • @{creator.username}
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)]">
							{t.presetDetail.tipCreatorSubtitle}
						</p>
					</div>
				</div>

				{step === "select" && (
					<div className="space-y-4">
						{/* Preset Tiers */}
						<div className="grid grid-cols-3 gap-2.5">
							{TIP_TIERS.map((tier) => (
								<button
									key={tier.amount}
									type="button"
									onClick={() => {
										setSelectedAmount(tier.amount);
										setCustomAmount("");
									}}
									className={`p-3 rounded-xl border text-center transition-all ${
										selectedAmount === tier.amount && !customAmount
											? "bg-amber-400/15 border-amber-400 ring-1 ring-amber-400 text-amber-300"
											: "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-amber-400/40"
									}`}
								>
									<span className="text-xl block mb-1">{tier.icon}</span>
									<span className="block text-xs font-bold text-[var(--color-text-primary)]">
										Rp {tier.amount.toLocaleString(language === "id" ? "id-ID" : "en-US")}
									</span>
									<span className="block text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
										{t.presetDetail[tier.labelKey]}
									</span>
								</button>
							))}
						</div>

						{/* Custom Amount Input */}
						<div className="space-y-1">
							<label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
								{t.presetDetail.tipCustom} (Rp):
							</label>
							<input
								type="number"
								placeholder="Contoh: 15000"
								value={customAmount}
								min={1000}
								step={1000}
								onChange={(e) => setCustomAmount(e.target.value)}
								className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-amber-400"
							/>
						</div>

						{/* Friendly Note */}
						<div className="space-y-1">
							<label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
								Pesan buat kreator (Opsional):
							</label>
							<input
								type="text"
								placeholder="Makasih presetnya bang, sound-nya mantap!"
								value={message}
								maxLength={150}
								onChange={(e) => setMessage(e.target.value)}
								className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-amber-400"
							/>
						</div>

						{/* Next Action Button */}
						<button
							type="button"
							onClick={handleProceedToQris}
							disabled={isSubmitting || finalAmount < 1000}
							className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
						>
							{isSubmitting ? (
								<Loader2 className="w-4 h-4 animate-spin text-slate-950" />
							) : (
								<QrCode className="w-4 h-4 text-slate-950" />
							)}
							<span>
								Lanjut Bayar Rp{" "}
								{finalAmount.toLocaleString(
									language === "id" ? "id-ID" : "en-US",
								)}{" "}
								via QRIS
							</span>
						</button>
					</div>
				)}

				{step === "qris" && (
					<div className="space-y-4 text-center">
						<div className="p-4 bg-white rounded-2xl inline-block shadow-md mx-auto border border-neutral-200">
							{/* Simulated Dynamic QRIS SVG */}
							<svg
								className="w-44 h-44 mx-auto"
								viewBox="0 0 100 100"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<rect x="5" y="5" width="26" height="26" rx="4" fill="#000" />
								<rect x="9" y="9" width="18" height="18" rx="2" fill="#fff" />
								<rect x="13" y="13" width="10" height="10" fill="#000" />

								<rect x="69" y="5" width="26" height="26" rx="4" fill="#000" />
								<rect x="73" y="9" width="18" height="18" rx="2" fill="#fff" />
								<rect x="77" y="13" width="10" height="10" fill="#000" />

								<rect x="5" y="69" width="26" height="26" rx="4" fill="#000" />
								<rect x="9" y="73" width="18" height="18" rx="2" fill="#fff" />
								<rect x="13" y="77" width="10" height="10" fill="#000" />

								<rect x="36" y="8" width="6" height="6" fill="#000" />
								<rect x="48" y="20" width="6" height="6" fill="#000" />
								<rect x="36" y="36" width="28" height="28" rx="4" fill="#F59E0B" />
								<path
									d="M44 50L48 54L56 44"
									stroke="#fff"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<rect x="70" y="38" width="6" height="6" fill="#000" />
								<rect x="36" y="72" width="6" height="6" fill="#000" />
								<rect x="60" y="72" width="6" height="6" fill="#000" />
							</svg>
						</div>

						<div className="space-y-1">
							<p className="text-sm font-bold text-[var(--color-text-primary)]">
								Scan QRIS • Rp{" "}
								{finalAmount.toLocaleString(
									language === "id" ? "id-ID" : "en-US",
								)}
							</p>
							<p className="text-[11px] text-[var(--color-text-secondary)]">
								Buka GoPay, DANA, OVO, ShopeePay, atau BCA Mobile
							</p>
						</div>

						<div className="flex gap-2 pt-1">
							<button
								type="button"
								onClick={() => setStep("select")}
								className="flex-1 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-white transition-colors"
							>
								Ubah Nominal
							</button>
							<button
								type="button"
								onClick={handleSimulatedPaymentSuccess}
								className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
							>
								<CheckCircle2 className="w-4 h-4" />
								<span>Saya Sudah Bayar</span>
							</button>
						</div>
					</div>
				)}

				{step === "success" && (
					<div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
						<div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
							<Heart className="w-8 h-8 fill-current text-rose-500" />
						</div>
						<div>
							<h4 className="text-base font-bold text-white">
								{t.presetDetail.tipSuccessTitle}
							</h4>
							<p className="text-xs text-[var(--color-text-secondary)] mt-1">
								{t.presetDetail.tipSuccessDesc}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
