"use client";

import { useAuth } from "@/context/AuthContext";
import {
	Check,
	Copy,
	Download,
	ExternalLink,
	FileCode,
	Loader2,
	Lock,
	QrCode,
	Share2,
	ShoppingBag,
	Smartphone,
	Zap,
} from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { type PresetOrderItem, PresetPaymentModal } from "./PresetPaymentModal";

interface InstallSectionProps {
	preset: {
		id: string;
		title: string;
		fileType?: "xml" | "qr" | "link" | string;
		fileUrl?: string | null;
		amLink?: string | null;
		price?: number;
		isPaid?: boolean;
		currency?: string;
		hasAccess?: boolean;
	};
}

export function InstallSection({ preset }: InstallSectionProps) {
	const { requireAuth } = useAuth();
	const [copied, setCopied] = useState(false);
	const [shared, setShared] = useState(false);
	const [isOrdering, setIsOrdering] = useState(false);
	const [orderError, setOrderError] = useState<string | null>(null);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [currentOrder, setCurrentOrder] = useState<PresetOrderItem | null>(
		null,
	);

	const isLocked = Boolean(preset.isPaid && !preset.hasAccess);

	// SECURITY: If locked, never copy sensitive file or AM links
	const linkToCopy = isLocked
		? typeof window !== "undefined"
			? window.location.href
			: ""
		: preset.amLink ||
			preset.fileUrl ||
			(typeof window !== "undefined" ? window.location.href : "");

	const handleDownload = async (
		e: React.MouseEvent<HTMLAnchorElement>,
		type: "amLink" | "fileUrl",
		fallbackUrl: string,
	) => {
		e.preventDefault();
		try {
			const response = await fetch(`/api/presets/${preset.id}/download`, {
				method: "POST",
			});
			if (!response.ok) throw new Error("Failed to track download");
			const data = await response.json();
			const finalUrl = data?.download_url || fallbackUrl;

			if (type === "amLink") {
				const isMobile =
					typeof navigator !== "undefined" &&
					/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

				if (isMobile && finalUrl.includes("alight")) {
					window.location.href = finalUrl;
				} else {
					window.open(finalUrl, "_blank", "noopener,noreferrer");
				}
			} else {
				const a = document.createElement("a");
				a.href = finalUrl;
				a.download = "";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}

			posthog.capture("preset_downloaded", {
				preset_id: preset.id,
				file_type: preset.fileType ?? "xml",
			});
		} catch (err) {
			console.error("Failed to track download", err);
			if (type === "amLink") {
				window.open(fallbackUrl, "_blank", "noopener,noreferrer");
			} else {
				const a = document.createElement("a");
				a.href = fallbackUrl;
				a.download = "";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}
		}
	};

	const trackDownloadHelper = async () => {
		try {
			await fetch(`/api/presets/${preset.id}/download`, {
				method: "POST",
			});
		} catch (e) {}
	};

	const handleCopy = async () => {
		if (!linkToCopy) return;
		try {
			await navigator.clipboard.writeText(linkToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			trackDownloadHelper();
		} catch (e) {
			console.error("Failed to copy link", e);
		}
	};

	const handleShare = async () => {
		const currentUrl =
			typeof window !== "undefined" ? window.location.href : "";
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: `${preset.title} | AMHUB Alight Motion Preset`,
					text: `Download preset Alight Motion: ${preset.title}`,
					url: currentUrl,
				});
				setShared(true);
				setTimeout(() => setShared(false), 2000);
			} catch (err) {
				handleCopy();
			}
		} else {
			handleCopy();
		}
	};

	const handlePurchase = async () => {
		if (!requireAuth(undefined, "Login untuk membeli preset ini")) return;
		setIsOrdering(true);
		setOrderError(null);
		try {
			const res = await fetch("/api/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ preset_id: preset.id }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error?.message || "Gagal membuat order.");
			}
			const orderData = (data?.data || data) as PresetOrderItem;
			setCurrentOrder(orderData);
			setIsPaymentModalOpen(true);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal memproses order";
			setOrderError(msg);
		} finally {
			setIsOrdering(false);
		}
	};

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-5 shadow-lg relative overflow-hidden">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
						<Download className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
							<span>Download & Import</span>
							<span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
								1-TAP
							</span>
						</h2>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Instant Project Import to Alight Motion
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						{preset.fileType?.toUpperCase() || "XML"}
					</span>
					{preset.isPaid && (preset.price ?? 0) > 0 ? (
						<span className="px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wider bg-amber-400 text-amber-950 shadow-md">
							Rp {(preset.price ?? 0).toLocaleString("id-ID")}
						</span>
					) : (
						<span className="px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wider bg-emerald-500/90 text-white shadow-md">
							GRATIS
						</span>
					)}
				</div>
			</div>

			{/* Main Action Buttons */}
			{isLocked ? (
				<div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-3">
					<div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
						<Lock className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-[var(--color-text-primary)]">
							Preset Berbayar Eksklusif
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto mt-0.5">
							Beli sekarang untuk langsung membuka akses download file XML, QR
							Code, dan link import Alight Motion.
						</p>
					</div>

					{orderError && (
						<p className="text-xs text-rose-400 font-semibold">{orderError}</p>
					)}

					<button
						type="button"
						onClick={handlePurchase}
						disabled={isOrdering}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
					>
						{isOrdering ? (
							<Loader2 className="w-4.5 h-4.5 animate-spin text-slate-950" />
						) : (
							<ShoppingBag className="w-4.5 h-4.5 text-slate-950 fill-current" />
						)}
						<span>
							{isOrdering
								? "Memproses Order..."
								: `Beli Sekarang • Rp ${(preset.price ?? 0).toLocaleString("id-ID")}`}
						</span>
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{preset.amLink && (
						<a
							href={preset.amLink}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => handleDownload(e, "amLink", preset.amLink || "")}
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all group"
						>
							<Zap className="w-4.5 h-4.5 fill-current text-white animate-pulse" />
							<span>Open in Alight Motion</span>
							<ExternalLink className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 transition-transform" />
						</a>
					)}

					{preset.fileUrl && (
						<a
							href={preset.fileUrl}
							download
							onClick={(e) =>
								handleDownload(e, "fileUrl", preset.fileUrl || "")
							}
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-bold text-sm border border-[var(--color-border-subtle)] hover:border-emerald-500/40 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
						>
							{preset.fileType === "qr" ? (
								<QrCode className="w-4.5 h-4.5 text-purple-400" />
							) : (
								<FileCode className="w-4.5 h-4.5 text-emerald-400" />
							)}
							<span>Download {preset.fileType?.toUpperCase() || "File"}</span>
						</a>
					)}
				</div>
			)}

			{/* Direct Link / Copy / Share Bar */}
			{linkToCopy && (
				<div className="space-y-2 pt-1">
					<div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
						<span>Direct Import Link / URL</span>
						<button
							type="button"
							onClick={handleShare}
							className="inline-flex items-center gap-1 text-[var(--color-interactive-primary)] hover:underline"
						>
							<Share2 className="w-3.5 h-3.5" />
							<span>{shared ? "Shared!" : "Share"}</span>
						</button>
					</div>
					<div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
						<code className="flex-1 text-xs text-[var(--color-text-secondary)] truncate px-2 font-mono">
							{linkToCopy}
						</code>
						<button
							type="button"
							onClick={handleCopy}
							className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-md bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] active:scale-95 transition-all shrink-0"
						>
							{copied ? (
								<>
									<Check className="w-3.5 h-3.5 text-emerald-400" />
									<span className="text-emerald-400">Copied!</span>
								</>
							) : (
								<>
									<Copy className="w-3.5 h-3.5" />
									<span>Copy</span>
								</>
							)}
						</button>
					</div>
				</div>
			)}

			{/* Mobile Quick Guide */}
			<div className="p-4 rounded-lg bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 space-y-2">
				<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
					<Smartphone className="w-4 h-4 text-indigo-400" />
					<span>Cara Pasang Preset di Alight Motion:</span>
				</div>
				<ol className="list-decimal list-inside text-xs text-[var(--color-text-secondary)] space-y-1.5 leading-relaxed pl-1">
					<li>
						Tekan tombol <strong>Open in Alight Motion</strong> di HP kamu.
					</li>
					<li>
						Jika download file <strong>XML</strong>: Buka Alight Motion &gt;
						Project &gt; Import XML.
					</li>
					<li>
						Jika pakai <strong>Preset Link 5MB</strong>: Klik link di atas,
						Alight Motion akan otomatis mendownload aset project.
					</li>
				</ol>
			</div>

			{/* Checkout & Payment Modal */}
			{preset.isPaid && (
				<PresetPaymentModal
					isOpen={isPaymentModalOpen}
					onClose={() => setIsPaymentModalOpen(false)}
					preset={{
						id: preset.id,
						title: preset.title,
						price: preset.price || 0,
						currency: preset.currency,
					}}
					initialOrder={currentOrder}
					onPaymentSuccess={() => {
						setIsPaymentModalOpen(false);
						window.location.reload();
					}}
				/>
			)}
		</section>
	);
}
