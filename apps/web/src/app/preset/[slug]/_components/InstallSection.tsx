"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n";
import Link from "next/link";
import {
	Check,
	ChevronDown,
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
	Sparkles,
	UserPlus,
	Zap,
} from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import QRCode from "react-qr-code";
import { type PresetOrderItem, PresetPaymentModal } from "./PresetPaymentModal";
import { TipCreatorModal } from "./TipCreatorModal";

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
		amVersionMin?: string | null;
		amVersionMax?: string | null;
		commercialPrice?: number | null;
		license?: "personal" | "commercial" | null;
		socialLockEnabled?: boolean;
		sultanPackUrl?: string | null;
		creator?: {
			id?: string;
			username: string;
			displayName: string;
			avatarUrl?: string | null;
			isFollowing?: boolean;
		};
	};
}

export function InstallSection({ preset }: InstallSectionProps) {
	const { currentUser, requireAuth } = useAuth();
	const { t, language } = useLanguage();
	const [copied, setCopied] = useState(false);
	const [shared, setShared] = useState(false);
	const [showGuide, setShowGuide] = useState(false);
	const [isOrdering, setIsOrdering] = useState(false);
	const [orderError, setOrderError] = useState<string | null>(null);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [currentOrder, setCurrentOrder] = useState<PresetOrderItem | null>(
		null,
	);
	const [selectedLicense, setSelectedLicense] = useState<
		"personal" | "commercial"
	>("personal");

	const isOwnPreset = Boolean(
		currentUser &&
			preset.creator &&
			(currentUser.id === preset.creator.id ||
				currentUser.username.toLowerCase() ===
					preset.creator.username.toLowerCase()),
	);
	const [isFollowingCreator, setIsFollowingCreator] = useState(
		Boolean(preset.creator?.isFollowing || isOwnPreset),
	);
	const [isFollowBypassed, setIsFollowBypassed] = useState(false);
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const [showSultanTipModal, setShowSultanTipModal] = useState(false);

	const isLocked = Boolean(preset.isPaid && !preset.hasAccess);
	const isFreePreset = !preset.isPaid || (preset.price ?? 0) === 0;
	const isSocialLocked =
		isFreePreset &&
		preset.socialLockEnabled !== false &&
		Boolean(preset.creator?.username) &&
		!isOwnPreset &&
		!isFollowingCreator &&
		!isFollowBypassed;
	const commercialOffered = (preset.commercialPrice ?? 0) > 0;
	const effectiveLicense =
		selectedLicense === "commercial" && commercialOffered
			? "commercial"
			: "personal";
	const effectivePrice =
		effectiveLicense === "commercial"
			? (preset.commercialPrice ?? preset.price ?? 0)
			: (preset.price ?? 0);

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
		if (!requireAuth(undefined, t.presetDetail.signInToPurchase)) return;
		setIsOrdering(true);
		setOrderError(null);
		try {
			const res = await fetch("/api/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					preset_id: preset.id,
					license_type: effectiveLicense,
				}),
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

	const handleFollowAndUnlock = async () => {
		if (!preset.creator?.username) {
			setIsFollowBypassed(true);
			return;
		}
		if (!requireAuth(undefined, t.presetDetail.signInToFollow)) return;

		setIsFollowLoading(true);
		try {
			const res = await fetch(`/api/users/${preset.creator.username}/follow`, {
				method: "POST",
			});
			if (!res.ok) throw new Error("Failed to follow");
			setIsFollowingCreator(true);
			setIsFollowBypassed(true);
			posthog.capture("creator_followed_via_social_lock", {
				creator_username: preset.creator.username,
				preset_id: preset.id,
			});
		} catch (err) {
			console.error("Follow error", err);
			setIsFollowBypassed(true);
		} finally {
			setIsFollowLoading(false);
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
							<span>{t.presetDetail.downloadAndImport}</span>
							<span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
								1-TAP
							</span>
						</h2>
						<p className="text-xs text-[var(--color-text-secondary)]">
							{t.presetDetail.instantProjectImport}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						{preset.fileType?.toUpperCase() || "XML"}
					</span>
					{!isLocked && preset.isPaid && preset.license && (
						<span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
							{t.presetDetail.license}:{" "}
							{preset.license === "commercial"
								? t.presetDetail.licenseCommercial
								: t.presetDetail.licensePersonal}
						</span>
					)}
					{preset.isPaid && (preset.price ?? 0) > 0 ? (
						<span className="px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wider bg-amber-400 text-amber-950 shadow-md">
							Rp{" "}
							{(preset.price ?? 0).toLocaleString(
								language === "id" ? "id-ID" : "en-US",
							)}
						</span>
					) : (
						<span className="px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wider bg-emerald-500/90 text-white shadow-md">
							{t.presetDetail.freeBadge}
						</span>
					)}
				</div>
			</div>

			{(preset.amVersionMin || preset.amVersionMax) && (
				<div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
					<Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
					<div className="text-xs">
						<p className="font-bold text-[var(--color-text-primary)]">
							{t.presetDetail.compatibility}{" "}
							{preset.amVersionMin && preset.amVersionMax
								? `AM ${preset.amVersionMin} – ${preset.amVersionMax}`
								: preset.amVersionMin
									? t.presetDetail.amOrNewer.replace("{version}", preset.amVersionMin)
									: t.presetDetail.upToAm.replace("{version}", preset.amVersionMax || "")}
						</p>
						<p className="text-[var(--color-text-secondary)] mt-0.5">
							{t.presetDetail.compatibilityNotice}
						</p>
					</div>
				</div>
			)}

			{/* Main Action Buttons */}
			{isLocked ? (
				<div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-3">
					<div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
						<Lock className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-[var(--color-text-primary)]">
							{t.presetDetail.exclusivePaid}
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto mt-0.5">
							{t.presetDetail.paidNotice}
						</p>
					</div>

					{orderError && (
						<p className="text-xs text-rose-400 font-semibold">{orderError}</p>
					)}

					{commercialOffered && (
						<div className="grid grid-cols-2 gap-2 text-left">
							<button
								type="button"
								onClick={() => setSelectedLicense("personal")}
								className={`p-3 rounded-xl border transition-all ${
									effectiveLicense === "personal"
										? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500"
										: "bg-black/20 border-amber-500/20 hover:border-amber-500/50"
								}`}
							>
								<span className="block text-[11px] font-bold text-[var(--color-text-primary)]">
									{t.presetDetail.personalLicense}
								</span>
								<span className="block text-[10px] text-[var(--color-text-secondary)] mt-0.5">
									{t.presetDetail.personalLicenseDesc}
								</span>
								<span className="block text-xs font-extrabold text-amber-400 mt-1">
									Rp {(preset.price ?? 0).toLocaleString(language === "id" ? "id-ID" : "en-US")}
								</span>
							</button>
							<button
								type="button"
								onClick={() => setSelectedLicense("commercial")}
								className={`p-3 rounded-xl border transition-all ${
									effectiveLicense === "commercial"
										? "bg-cyan-500/15 border-cyan-500 ring-1 ring-cyan-500"
										: "bg-black/20 border-cyan-500/20 hover:border-cyan-500/50"
								}`}
							>
								<span className="block text-[11px] font-bold text-[var(--color-text-primary)]">
									{t.presetDetail.commercialLicense}
								</span>
								<span className="block text-[10px] text-[var(--color-text-secondary)] mt-0.5">
									{t.presetDetail.commercialLicenseDesc}
								</span>
								<span className="block text-xs font-extrabold text-cyan-400 mt-1">
									Rp {(preset.commercialPrice ?? 0).toLocaleString(language === "id" ? "id-ID" : "en-US")}
								</span>
							</button>
						</div>
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
								? t.presetDetail.processingOrder
								: `${effectiveLicense === "commercial" ? t.presetDetail.buyCommercial : t.presetDetail.buyNow} • Rp ${effectivePrice.toLocaleString(language === "id" ? "id-ID" : "en-US")}`}
						</span>
					</button>
				</div>
			) : isSocialLocked ? (
				<div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/30 text-center space-y-3.5 shadow-md">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
						<UserPlus className="w-6 h-6" />
					</div>
					<div className="space-y-1">
						<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
							<span>⚡ {t.presetDetail.socialLockBadge}</span>
						</div>
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							{t.presetDetail.socialLockTitle.replace("{username}", preset.creator?.username || "Kreator")}
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
							{t.presetDetail.socialLockDesc}
						</p>
					</div>

					<div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
						<button
							type="button"
							onClick={handleFollowAndUnlock}
							disabled={isFollowLoading}
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] px-7 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
						>
							{isFollowLoading ? (
								<Loader2 className="w-4 h-4 animate-spin text-white" />
							) : (
								<UserPlus className="w-4 h-4" />
							)}
							<span>
								{t.presetDetail.followAndUnlock.replace("{username}", preset.creator?.username || "Kreator")}
							</span>
						</button>
					</div>

					<div>
						<button
							type="button"
							onClick={() => setIsFollowBypassed(true)}
							className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] underline transition-colors cursor-pointer"
						>
							{t.presetDetail.skipAndDownload}
						</button>
					</div>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{preset.amLink &&
							preset.amLink
								.split("|")
								.map((l) => l.trim())
								.filter(Boolean)
								.map((link, idx) => {
									const isGdrive = link
										.toLowerCase()
										.includes("drive.google.com");
									const label = isGdrive
										? t.presetDetail.openGoogleDrive
										: t.presetDetail.openInAm;
									return (
										<a
											key={`${link}-${idx}`}
											href={link}
											target="_blank"
											rel="noopener noreferrer"
											onClick={(e) =>
												handleDownload(e, "amLink", link)
											}
											className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all group"
										>
											<Zap className="w-4.5 h-4.5 fill-current text-white animate-pulse" />
											<span>{label}</span>
											<ExternalLink className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 transition-transform" />
										</a>
									);
								})}

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
									<QrCode className="w-4.5 h-4.5 text-cyan-400" />
								) : (
									<FileCode className="w-4.5 h-4.5 text-emerald-400" />
								)}
								<span>{t.presetDetail.downloadXml.replace("{type}", preset.fileType?.toUpperCase() || "File")}</span>
							</a>
						)}
					</div>

					{/* Paket Sultan Upsell Card */}
					<div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
						<div className="space-y-1">
							<div className="flex items-center gap-1.5">
								<span className="text-base">💎</span>
								<h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
									{t.presetDetail.sultanPackTitle}
								</h4>
								<span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
									HEMAT WAKTU
								</span>
							</div>
							<p className="text-xs text-[var(--color-text-secondary)] max-w-md leading-relaxed">
								{t.presetDetail.sultanPackDesc}
							</p>
						</div>

						{preset.creator && (
							<button
								type="button"
								onClick={() => setShowSultanTipModal(true)}
								className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
							>
								<Sparkles className="w-3.5 h-3.5 fill-current" />
								<span>{t.presetDetail.sultanPackCta}</span>
							</button>
						)}
					</div>

					{/* Jasa Joki / Custom Edit Card */}
					{preset.creator && (
						<div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
							<div className="space-y-1">
								<div className="flex items-center gap-1.5">
									<span className="text-base">💼</span>
									<h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
										{language === "id"
											? "Mau Video Mirip Ini Tapi Pake Foto/Lagu Sendiri?"
											: "Want a Custom Edit Like This?"}
									</h4>
									<span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
										{language === "id" ? "JASA JOKI EDIT" : "COMMISSION"}
									</span>
								</div>
								<p className="text-xs text-[var(--color-text-secondary)] max-w-md leading-relaxed">
									{language === "id"
										? `Mager ngedit sendiri? Sewa @${preset.creator.username} buat bikinin video custom ultah, cinematic motor, atau jedag-jedug sesuai sound TikTok pilihan lu!`
										: `Too busy to edit? Hire @${preset.creator.username} to craft a custom Alight Motion edit for your favorite TikTok sound!`}
								</p>
							</div>

							<Link
								href={`/requests?creator=${encodeURIComponent(preset.creator.username)}`}
								className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
							>
								<Sparkles className="w-3.5 h-3.5 fill-current" />
								<span>{language === "id" ? "Order Jasa Joki" : "Hire Creator"}</span>
							</Link>
						</div>
					)}

					{/* Compact Direct Link & QR Code Utility Bar */}
					{linkToCopy && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
							{/* Direct Link Box */}
							<div className="p-3.5 rounded-xl bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 flex flex-col justify-between space-y-2">
								<div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
									<span>{t.presetDetail.directImportLink}</span>
									<button
										type="button"
										onClick={handleShare}
										className="inline-flex items-center gap-1 text-[var(--color-interactive-primary)] hover:underline text-[11px]"
									>
										<Share2 className="w-3 h-3" />
										<span>{shared ? t.presetDetail.shared : t.presetDetail.share}</span>
									</button>
								</div>
								<div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
									<code className="flex-1 text-[11px] text-[var(--color-text-secondary)] truncate px-1.5 font-mono">
										{linkToCopy}
									</code>
									<button
										type="button"
										onClick={handleCopy}
										className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-md bg-[var(--color-bg-elevated)] text-[11px] font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] active:scale-95 transition-all shrink-0"
									>
										{copied ? (
											<>
												<Check className="w-3 h-3 text-emerald-400" />
												<span className="text-emerald-400">{t.presetDetail.copied}</span>
											</>
										) : (
											<>
												<Copy className="w-3 h-3" />
												<span>{t.presetDetail.copy}</span>
											</>
										)}
									</button>
								</div>
							</div>

							{/* QR Code Box */}
							{preset.fileType === "qr" && preset.fileUrl ? (
								<div className="p-3.5 rounded-xl bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 flex items-center gap-3">
									<div className="p-1.5 rounded-lg bg-white shadow-md shrink-0">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={preset.fileUrl}
											alt={`QR Code ${preset.title}`}
											className="w-16 h-16 object-contain rounded"
											loading="lazy"
										/>
									</div>
									<div className="text-left min-w-0">
										<p className="text-xs font-bold text-[var(--color-text-primary)]">
											{t.presetDetail.scanQrTitle}
										</p>
										<p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
											{t.presetDetail.scanQrDesc}
										</p>
									</div>
								</div>
							) : (
								<div className="p-3.5 rounded-xl bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 flex items-center gap-3">
									<div className="p-1.5 rounded-lg bg-white shadow-md shrink-0">
										<QRCode
											value={linkToCopy}
											size={60}
											bgColor="#ffffff"
											fgColor="#08070c"
										/>
									</div>
									<div className="text-left min-w-0">
										<p className="text-xs font-bold text-[var(--color-text-primary)]">
											{t.presetDetail.importMobileTitle}
										</p>
										<p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
											{t.presetDetail.importMobileDesc}
										</p>
									</div>
								</div>
							)}
						</div>
					)}
				</>
			)}

			{/* Collapsible Mobile & Desktop Quick Guide */}
			<div className="rounded-xl bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/60 overflow-hidden transition-all">
				<button
					type="button"
					onClick={() => setShowGuide(!showGuide)}
					className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]/50 transition-colors"
				>
					<div className="flex items-center gap-2">
						<Smartphone className="w-4 h-4 text-sky-400" />
						<span>{t.presetDetail.quickGuideTitle}</span>
						<span className="text-[10px] font-normal text-[var(--color-text-tertiary)] hidden sm:inline">
							{t.presetDetail.quickGuideBadge}
						</span>
					</div>
					<ChevronDown
						className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform duration-200 ${
							showGuide ? "rotate-180" : ""
						}`}
					/>
				</button>

				{showGuide && (
					<div className="px-4 pb-3.5 pt-1 border-t border-[var(--color-border-subtle)]/40">
						<div className="space-y-2 text-xs text-[var(--color-text-secondary)] leading-relaxed pl-1">
							<div className="space-y-0.5">
								<p className="font-bold text-[var(--color-text-primary)]">
									{t.presetDetail.guideStep1Title}
								</p>
								<p>{t.presetDetail.guideStep1Desc}</p>
							</div>
							<div className="space-y-0.5 pt-1">
								<p className="font-bold text-[var(--color-text-primary)]">
									{t.presetDetail.guideStep2Title}
								</p>
								<p>{t.presetDetail.guideStep2Desc}</p>
							</div>
							<div className="p-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] mt-2">
								{t.presetDetail.guideTip}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Checkout & Payment Modal */}
			{preset.isPaid && (
				<PresetPaymentModal
					isOpen={isPaymentModalOpen}
					onClose={() => setIsPaymentModalOpen(false)}
					preset={{
						id: preset.id,
						title: preset.title,
						price: effectivePrice,
						currency: preset.currency,
					}}
					initialOrder={currentOrder}
					onPaymentSuccess={() => {
						setIsPaymentModalOpen(false);
						window.location.reload();
					}}
				/>
			)}

			{preset.creator && (
				<TipCreatorModal
					isOpen={showSultanTipModal}
					onClose={() => setShowSultanTipModal(false)}
					creator={preset.creator}
					initialAmount={5000}
					defaultMessage={`Halo @${preset.creator.username}, saya mau minta Paket Sultan (All-in-One HD assets) untuk preset: ${preset.title}`}
				/>
			)}
		</section>
	);
}
