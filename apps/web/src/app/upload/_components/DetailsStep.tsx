"use client";

import { normalizeAmVersion } from "@/lib/am-version";
import {
	Banknote,
	Check,
	Coins,
	Flame,
	Gamepad2,
	Gift,
	Info,
	Layers,
	Layers3,
	Smartphone,
	Sparkles,
	Volume2,
	Waves,
	Zap,
} from "lucide-react";

interface DetailsStepProps {
	title: string;
	onTitleChange: (title: string) => void;
	description: string;
	onDescriptionChange: (desc: string) => void;
	category: string;
	onCategoryChange: (category: string) => void;
	difficulty: "beginner" | "intermediate" | "advanced";
	onDifficultyChange: (diff: "beginner" | "intermediate" | "advanced") => void;
	isPaid: boolean;
	onIsPaidChange: (isPaid: boolean) => void;
	price: number;
	onPriceChange: (price: number) => void;
	amVersionMin: string;
	onAmVersionMinChange: (version: string) => void;
	amVersionMax: string;
	onAmVersionMaxChange: (version: string) => void;
}

const CATEGORIES = [
	{ id: "jj", label: "JJ", icon: Zap },
	{ id: "jj-tipis", label: "JJ Tipis", icon: Sparkles },
	{ id: "jj-melar", label: "JJ Kenyat-Kenyot", icon: Flame },
	{ id: "jj-belah", label: "JJ Belah", icon: Layers },
	{ id: "jj-abstract", label: "JJ Abstract", icon: Layers3 },
	{ id: "jj-db", label: "JJ DB", icon: Volume2 },
	{ id: "jj-mekdi", label: "JJ Mekdi", icon: Flame },
	{ id: "jj-kenyal", label: "JJ Kenyal", icon: Waves },
	{ id: "gaming", label: "Gaming", icon: Gamepad2 },
];

const DIFFICULTIES = [
	{ id: "beginner" as const, label: "Beginner" },
	{ id: "intermediate" as const, label: "Intermediate" },
	{ id: "advanced" as const, label: "Advanced" },
];

const PRESET_PRICES = [5000, 10000, 15000, 25000, 50000];

export function DetailsStep({
	title,
	onTitleChange,
	description,
	onDescriptionChange,
	category,
	onCategoryChange,
	difficulty,
	onDifficultyChange,
	isPaid,
	onIsPaidChange,
	price,
	onPriceChange,
	amVersionMin,
	onAmVersionMinChange,
	amVersionMax,
	onAmVersionMaxChange,
}: DetailsStepProps) {
	// Payout estimation (QRIS 0.7% fee + 90:10 split)
	const qrisFee = Math.max(0, Math.round(price * 0.007));
	const netAmount = Math.max(0, price - qrisFee);
	const creatorEarnings = Math.round(netAmount * 0.9);
	const platformFee = netAmount - creatorEarnings;

	const isMinVersionValid =
		!amVersionMin.trim() || normalizeAmVersion(amVersionMin) !== null;
	const isMaxVersionValid =
		!amVersionMax.trim() || normalizeAmVersion(amVersionMax) !== null;

	return (
		<div className="space-y-6">
			{/* Title Input */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					<label htmlFor="upload-title-input">Preset Title *</label>
					<span
						className={
							title.length > 50
								? "text-amber-400"
								: "text-[var(--color-text-tertiary)]"
						}
					>
						{title.length}/60
					</span>
				</div>
				<input
					id="upload-title-input"
					type="text"
					maxLength={60}
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					placeholder="e.g. Smooth Velocity Edit #4"
					className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
				/>
			</div>

			{/* Description Textarea */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					<label htmlFor="upload-desc-input">Description</label>
					<span
						className={
							description.length > 250
								? "text-amber-400"
								: "text-[var(--color-text-tertiary)]"
						}
					>
						{description.length}/300
					</span>
				</div>
				<textarea
					id="upload-desc-input"
					rows={3}
					maxLength={300}
					value={description}
					onChange={(e) => onDescriptionChange(e.target.value)}
					placeholder="Briefly describe your preset, recommended FPS, keyframes..."
					className="w-full p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] resize-none"
				/>
			</div>

			{/* Pricing & Monetization Option */}
			<div className="space-y-3 pt-2">
				<div className="flex items-center justify-between">
					<span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Preset Pricing & Monetization *
					</span>
					<span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
						<Coins className="w-3.5 h-3.5" /> 90% Creator Revenue
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{/* Free Option */}
					<button
						type="button"
						onClick={() => {
							onIsPaidChange(false);
							onPriceChange(0);
						}}
						className={`p-4 rounded-2xl border text-left transition-all relative ${
							!isPaid
								? "bg-[var(--color-interactive-primary)]/10 border-[var(--color-interactive-primary)] ring-1 ring-[var(--color-interactive-primary)]"
								: "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2.5">
								<div
									className={`p-2 rounded-xl ${
										!isPaid
											? "bg-[var(--color-interactive-primary)] text-white"
											: "bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)]"
									}`}
								>
									<Gift className="w-4 h-4" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-[var(--color-text-primary)]">
										Gratis (Free)
									</h4>
									<p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
										Download bebas untuk semua pengguna
									</p>
								</div>
							</div>
							{!isPaid && (
								<div className="w-5 h-5 rounded-full bg-[var(--color-interactive-primary)] text-white flex items-center justify-center">
									<Check className="w-3.5 h-3.5" />
								</div>
							)}
						</div>
					</button>

					{/* Paid Option */}
					<button
						type="button"
						onClick={() => {
							onIsPaidChange(true);
							if (price <= 0) onPriceChange(10000);
						}}
						className={`p-4 rounded-2xl border text-left transition-all relative ${
							isPaid
								? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500"
								: "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2.5">
								<div
									className={`p-2 rounded-xl ${
										isPaid
											? "bg-amber-500 text-amber-950 font-black"
											: "bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)]"
									}`}
								>
									<Banknote className="w-4 h-4" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-[var(--color-text-primary)]">
										Berbayar (Paid Preset)
									</h4>
									<p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
										Set harga & dapatkan 90% per penjualan
									</p>
								</div>
							</div>
							{isPaid && (
								<div className="w-5 h-5 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center">
									<Check className="w-3.5 h-3.5" />
								</div>
							)}
						</div>
					</button>
				</div>

				{/* Expanded Paid Configuration */}
				{isPaid && (
					<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-amber-500/30 space-y-4 animate-fadeIn">
						<div className="space-y-2">
							<label
								htmlFor="preset-price-input"
								className="flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider"
							>
								<span>Set Preset Price (IDR)</span>
								<span className="text-amber-400 font-normal normal-case">
									Minimal Rp 1.000
								</span>
							</label>

							{/* Quick Price Selector Chips */}
							<div className="flex flex-wrap gap-2">
								{PRESET_PRICES.map((p) => (
									<button
										key={p}
										type="button"
										onClick={() => onPriceChange(p)}
										className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
											price === p
												? "bg-amber-500 text-amber-950 shadow-md scale-105"
												: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:border-amber-500/50"
										}`}
									>
										Rp {p.toLocaleString("id-ID")}
									</button>
								))}
							</div>

							{/* Custom Price Input */}
							<div className="relative mt-2">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs text-[var(--color-text-secondary)]">
									Rp
								</span>
								<input
									id="preset-price-input"
									type="number"
									min={1000}
									max={10000000}
									step={1000}
									value={price || ""}
									onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
									placeholder="10000"
									className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
								/>
							</div>
						</div>

						{/* Earnings Breakdown Calculator */}
						<div className="p-3.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs space-y-2">
							<div className="flex items-center justify-between text-[var(--color-text-secondary)]">
								<span>Gross Price</span>
								<span className="font-semibold font-mono text-[var(--color-text-primary)]">
									Rp {price.toLocaleString("id-ID")}
								</span>
							</div>
							<div className="flex items-center justify-between text-[var(--color-text-tertiary)]">
								<span className="flex items-center gap-1">
									Est. QRIS Fee (0.7%)
								</span>
								<span className="font-mono">
									- Rp {qrisFee.toLocaleString("id-ID")}
								</span>
							</div>
							<div className="flex items-center justify-between text-[var(--color-text-tertiary)]">
								<span>AMHUB Platform Fee (10%)</span>
								<span className="font-mono">
									- Rp {platformFee.toLocaleString("id-ID")}
								</span>
							</div>
							<div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-sm font-bold text-emerald-400">
								<span>Creator Net Payout (90%)</span>
								<span className="font-mono text-base">
									+ Rp {creatorEarnings.toLocaleString("id-ID")}
								</span>
							</div>
							<p className="text-[10px] text-[var(--color-text-tertiary)] pt-1 flex items-center gap-1">
								<Info className="w-3 h-3 shrink-0 text-amber-400" />
								<span>
									Pembeli bisa bayar via QRIS (GoPay, OVO, Dana, BCA, Mandiri,
									dll). Payout ditransfer otomatis.
								</span>
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Category Selector */}
			<div className="space-y-2">
				<span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					Select Category *
				</span>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{CATEGORIES.map((cat) => {
						const Icon = cat.icon;
						const isSelected = category === cat.id;
						return (
							<button
								key={cat.id}
								type="button"
								onClick={() => onCategoryChange(cat.id)}
								className={`flex items-center gap-2 min-h-[44px] px-3.5 rounded-2xl border text-xs font-semibold transition-all active:scale-95 ${
									isSelected
										? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
										: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
								}`}
							>
								<Icon
									className={`w-4 h-4 ${isSelected ? "text-white" : "text-[var(--color-text-tertiary)]"}`}
								/>
								<span className="truncate">{cat.label}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Difficulty Selector */}
			<div className="space-y-2">
				<span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					Difficulty Level *
				</span>
				<div className="grid grid-cols-3 gap-2">
					{DIFFICULTIES.map((diff) => {
						const isSelected = difficulty === diff.id;
						return (
							<button
								key={diff.id}
								type="button"
								onClick={() => onDifficultyChange(diff.id)}
								className={`min-h-[44px] px-4 rounded-2xl border text-xs font-bold capitalize transition-all active:scale-95 ${
									isSelected
										? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
										: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
								}`}
							>
								{diff.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Alight Motion Version Support */}
			<div className="space-y-2">
				<span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					Versi Alight Motion
				</span>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<div className="space-y-1.5">
						<label
							htmlFor="upload-am-version-min"
							className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]"
						>
							<Smartphone className="w-3.5 h-3.5" />
							Versi Minimal
						</label>
						<input
							id="upload-am-version-min"
							type="text"
							inputMode="decimal"
							value={amVersionMin}
							onChange={(e) => onAmVersionMinChange(e.target.value)}
							placeholder="cth. 5.0.5 (opsional)"
							className={`w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border text-sm font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-sans focus:outline-none ${
								isMinVersionValid
									? "border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)]"
									: "border-rose-500 focus:border-rose-500"
							}`}
						/>
						{!isMinVersionValid && (
							<p className="text-[11px] text-rose-400 font-semibold">
								Format angka, cth. 5.0.5
							</p>
						)}
					</div>
					<div className="space-y-1.5">
						<label
							htmlFor="upload-am-version-max"
							className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]"
						>
							<Smartphone className="w-3.5 h-3.5" />
							Versi Maksimal
						</label>
						<input
							id="upload-am-version-max"
							type="text"
							inputMode="decimal"
							value={amVersionMax}
							onChange={(e) => onAmVersionMaxChange(e.target.value)}
							placeholder="cth. 5.1.0 (opsional)"
							className={`w-full min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border text-sm font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-sans focus:outline-none ${
								isMaxVersionValid
									? "border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)]"
									: "border-rose-500 focus:border-rose-500"
							}`}
						/>
						{!isMaxVersionValid && (
							<p className="text-[11px] text-rose-400 font-semibold">
								Format angka, cth. 5.1.0
							</p>
						)}
					</div>
				</div>
				<p className="text-[11px] text-[var(--color-text-tertiary)]">
					Kosongkan bila preset cocok untuk semua versi.
				</p>
			</div>
		</div>
	);
}
