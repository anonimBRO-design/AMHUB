"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Check, Clock, Gavel, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OfferItem {
	id: string;
	price: number;
	message: string | null;
	etaDays: number | null;
	status: string;
	creatorId: string;
	creatorUsername: string;
	creatorDisplayName: string;
}

interface RequestDetailClientProps {
	request: {
		id: string;
		title: string;
		description: string;
		budget_min: number;
		budget_max: number;
		status: string;
		created_at: string;
		requester: {
			username: string;
			display_name: string;
		};
	};
	initialOffers: OfferItem[];
	isOwner: boolean;
	currentUserId: string | null;
	isLoggedIn: boolean;
}

const STATUS_LABEL: Record<string, string> = {
	open: "Terbuka",
	in_progress: "Dikerjakan",
	completed: "Selesai",
	cancelled: "Dibatalkan",
};

export function RequestDetailClient({
	request,
	initialOffers,
	isOwner,
	currentUserId,
	isLoggedIn,
}: RequestDetailClientProps) {
	const router = useRouter();
	const { requireAuth } = useAuth();
	const [status, setStatus] = useState(request.status);
	const [offers, setOffers] = useState(initialOffers);
	const [price, setPrice] = useState("");
	const [message, setMessage] = useState("");
	const [eta, setEta] = useState("");
	const [busy, setBusy] = useState(false);
	const [actingId, setActingId] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
	const myOffer = offers.find((o) => o.creatorId === currentUserId);

	const callOfferAction = async (
		offerId: string,
		action: "accept" | "reject" | "withdraw",
	) => {
		setActingId(offerId);
		setNotice(null);
		try {
			const res = await fetch(`/api/requests/${request.id}/offers/${offerId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action }),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(json?.error?.message || "Aksi gagal.");
			}
			if (action === "accept") {
				setOffers((prev) =>
					prev.map((o) =>
						o.id === offerId
							? { ...o, status: "accepted" }
							: o.status === "pending"
								? { ...o, status: "rejected" }
								: o,
					),
				);
				setStatus("in_progress");
			} else if (action === "reject") {
				setOffers((prev) =>
					prev.map((o) =>
						o.id === offerId ? { ...o, status: "rejected" } : o,
					),
				);
			} else {
				setOffers((prev) =>
					prev.map((o) =>
						o.id === offerId ? { ...o, status: "withdrawn" } : o,
					),
				);
			}
		} catch (err) {
			setNotice(err instanceof Error ? err.message : "Aksi gagal.");
		} finally {
			setActingId(null);
		}
	};

	const handleSubmitOffer = async () => {
		if (!requireAuth(undefined, "Login untuk menawar")) return;
		const priceNum = Number(price) || 0;
		if (priceNum < 1000) {
			setNotice("Harga penawaran minimal Rp 1.000.");
			return;
		}
		setBusy(true);
		setNotice(null);
		try {
			const res = await fetch(`/api/requests/${request.id}/offers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					price: priceNum,
					message: message.trim() || undefined,
					eta_days: eta ? Number(eta) : undefined,
				}),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(json?.error?.message || "Gagal mengirim penawaran.");
			}
			setPrice("");
			setMessage("");
			setEta("");
			router.refresh();
			setNotice("Penawaran terkirim. Pemilik request akan meninjaunya.");
		} catch (err) {
			setNotice(
				err instanceof Error ? err.message : "Gagal mengirim penawaran.",
			);
		} finally {
			setBusy(false);
		}
	};

	const handleStatusChange = async (next: "completed" | "cancelled") => {
		setBusy(true);
		try {
			const res = await fetch(`/api/requests/${request.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: next }),
			});
			if (!res.ok) throw new Error("Gagal mengubah status.");
			setStatus(next);
			router.refresh();
		} catch {
			setNotice("Gagal mengubah status request.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-6">
			<button
				type="button"
				onClick={() => router.push("/requests")}
				className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-white transition-all active:scale-95"
			>
				<ArrowLeft className="w-4 h-4" />
				<span>Semua Request</span>
			</button>

			{/* Request header */}
			<div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl space-y-4">
				<div className="flex flex-wrap items-center gap-2">
					<span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
						{STATUS_LABEL[status] ?? status}
					</span>
					<span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
						{request.budget_min > 0
							? `${fmt(request.budget_min)} – ${fmt(request.budget_max)}`
							: fmt(request.budget_max)}
					</span>
				</div>
				<h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
					{request.title}
				</h1>
				<p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
					{request.description}
				</p>
				<p className="text-[11px] text-[var(--color-text-tertiary)]">
					Oleh @{request.requester.username} •{" "}
					{new Date(request.created_at).toLocaleDateString("id-ID", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
				</p>
				{isOwner && (status === "open" || status === "in_progress") && (
					<div className="flex flex-wrap gap-2 pt-1">
						{status === "in_progress" && (
							<button
								type="button"
								disabled={busy}
								onClick={() => handleStatusChange("completed")}
								className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
							>
								<Check className="w-4 h-4" />
								Tandai Selesai
							</button>
						)}
						<button
							type="button"
							disabled={busy}
							onClick={() => handleStatusChange("cancelled")}
							className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-rose-400 text-xs font-bold disabled:opacity-50"
						>
							<X className="w-4 h-4" />
							Batalkan Request
						</button>
					</div>
				)}
			</div>

			{notice && (
				<p className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-3">
					{notice}
				</p>
			)}

			{/* Offer form */}
			{!isOwner && status === "open" && (
				<div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
					<h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
						<Gavel className="w-4 h-4 text-amber-400" />
						{myOffer?.status === "pending"
							? "Perbarui Penawaranmu"
							: "Ajukan Penawaran"}
					</h2>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label
								htmlFor="offer-price"
								className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Harga (Rp) *
							</label>
							<input
								id="offer-price"
								type="number"
								min={1000}
								step={1000}
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="25000"
								className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>
						<div className="space-y-1.5">
							<label
								htmlFor="offer-eta"
								className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Estimasi (hari)
							</label>
							<input
								id="offer-eta"
								type="number"
								min={1}
								max={90}
								value={eta}
								onChange={(e) => setEta(e.target.value)}
								placeholder="3"
								className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>
					</div>
					<textarea
						rows={3}
						maxLength={1000}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Ceritakan pendekatanmu, pengalaman, portofolio..."
						className="w-full p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] resize-none"
					/>
					<button
						type="button"
						disabled={busy}
						onClick={handleSubmitOffer}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-[var(--color-interactive-primary)] text-white text-sm font-bold disabled:opacity-50"
					>
						{busy ? "Mengirim..." : "Kirim Penawaran"}
					</button>
				</div>
			)}

			{/* Offers list */}
			<section className="space-y-3">
				<h2 className="font-display text-lg font-bold text-white px-1 flex items-center gap-2">
					<Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
					Penawaran ({offers.length})
				</h2>
				{!isLoggedIn ? (
					<p className="text-xs text-[var(--color-text-secondary)] px-1">
						Login untuk melihat dan mengajukan penawaran.
					</p>
				) : offers.length === 0 ? (
					<div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-center">
						<p className="text-sm font-bold text-[var(--color-text-primary)]">
							Belum ada penawaran
						</p>
						<p className="text-xs text-[var(--color-text-secondary)] mt-1">
							Kreator akan menawar di sini setelah request dibuka.
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{offers.map((o) => (
							<div
								key={o.id}
								className={`p-4 rounded-2xl border space-y-2 ${
									o.status === "accepted"
										? "bg-emerald-500/[0.07] border-emerald-500/40"
										: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)]"
								}`}
							>
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-bold text-[var(--color-text-primary)]">
										@{o.creatorUsername}
									</span>
									<span className="text-sm font-extrabold text-emerald-400">
										{fmt(o.price)}
									</span>
								</div>
								{o.message && (
									<p className="text-xs text-[var(--color-text-secondary)]">
										{o.message}
									</p>
								)}
								<div className="flex flex-wrap items-center gap-2 pt-1">
									{o.etaDays ? (
										<span className="text-[11px] text-[var(--color-text-tertiary)]">
											Estimasi {o.etaDays} hari
										</span>
									) : null}
									<span className="text-[11px] font-bold uppercase text-[var(--color-text-tertiary)]">
										{o.status}
									</span>
									<div className="flex gap-2 ml-auto">
										{isOwner && o.status === "pending" && status === "open" && (
											<>
												<button
													type="button"
													disabled={actingId === o.id}
													onClick={() => callOfferAction(o.id, "accept")}
													className="px-4 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
												>
													Terima
												</button>
												<button
													type="button"
													disabled={actingId === o.id}
													onClick={() => callOfferAction(o.id, "reject")}
													className="px-4 min-h-[40px] rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-rose-400 text-xs font-bold disabled:opacity-50"
												>
													Tolak
												</button>
											</>
										)}
										{o.creatorId === currentUserId &&
											o.status === "pending" && (
												<button
													type="button"
													disabled={actingId === o.id}
													onClick={() => callOfferAction(o.id, "withdraw")}
													className="px-4 min-h-[40px] rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-xs font-bold disabled:opacity-50"
												>
													Tarik
												</button>
											)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
