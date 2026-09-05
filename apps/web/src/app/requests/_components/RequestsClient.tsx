"use client";

import { useAuth } from "@/context/AuthContext";
import type { CustomRequestWithMeta } from "@/dal/requests.dal";
import { Inbox, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_TABS = [
	{ id: "open", label: "Terbuka" },
	{ id: "in_progress", label: "Dikerjakan" },
	{ id: "completed", label: "Selesai" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["id"];

function formatBudget(min: number, max: number): string {
	const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
	if (min > 0) return `${fmt(min)} – ${fmt(max)}`;
	return fmt(max);
}

export function RequestsClient({
	initialRequests,
}: {
	initialRequests: CustomRequestWithMeta[];
}) {
	const router = useRouter();
	const { requireAuth } = useAuth();
	const [tab, setTab] = useState<StatusTab>("open");
	const [requests, setRequests] = useState(initialRequests);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [budgetMin, setBudgetMin] = useState("");
	const [budgetMax, setBudgetMax] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTab = async (next: StatusTab) => {
		setTab(next);
		setLoading(true);
		try {
			const res = await fetch(`/api/requests?status=${next}&limit=30`);
			const json = await res.json().catch(() => null);
			setRequests(res.ok ? (json?.data ?? []) : []);
		} catch {
			setRequests([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!requireAuth(undefined, "Login untuk membuat request")) return;
		const max = Number(budgetMax) || 0;
		const min = Number(budgetMin) || 0;
		if (!title.trim() || !description.trim()) {
			setError("Judul dan deskripsi wajib diisi.");
			return;
		}
		if (max < 1000 || min > max) {
			setError("Budget maksimal minimal Rp 1.000 dan >= budget minimal.");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch("/api/requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					budget_min: min,
					budget_max: max,
				}),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(json?.error?.message || "Gagal membuat request.");
			}
			setTitle("");
			setDescription("");
			setBudgetMin("");
			setBudgetMax("");
			setShowForm(false);
			if (tab === "open") loadTab("open");
			else router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal membuat request.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-0 space-y-6">
			{/* Header */}
			<div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/15 rounded-full blur-[90px]" />
				<div className="relative z-10 space-y-3">
					<div className="flex items-center gap-2 text-xs font-extrabold text-[var(--color-interactive-primary)] uppercase tracking-wider">
						<Inbox className="w-4 h-4" />
						<span>Request Custom</span>
					</div>
					<h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
						Minta Preset Impianmu
					</h1>
					<p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
						Posting brief + budget, kreator akan menawar. Pilih penawaran
						terbaik dan preset dibuat khusus untukmu.
					</p>
					<button
						type="button"
						onClick={() => {
							if (!requireAuth(undefined, "Login untuk membuat request"))
								return;
							setShowForm((v) => !v);
						}}
						className="inline-flex items-center gap-1.5 px-5 min-h-[48px] rounded-2xl bg-[var(--color-interactive-primary)] hover:bg-[var(--color-interactive-primary-hover)] text-white text-sm font-bold transition-all active:scale-95"
					>
						{showForm ? (
							<X className="w-4 h-4" />
						) : (
							<Plus className="w-4 h-4" />
						)}
						{showForm ? "Tutup Form" : "Buat Request"}
					</button>
				</div>
			</div>

			{/* Create form */}
			{showForm && (
				<div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="request-title"
							className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
						>
							Judul Request *
						</label>
						<input
							id="request-title"
							type="text"
							maxLength={100}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="cth. JJ Velocity jedag-jedug 30 detik"
							className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
						/>
					</div>
					<div className="space-y-1.5">
						<label
							htmlFor="request-desc"
							className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
						>
							Brief / Deskripsi *
						</label>
						<textarea
							id="request-desc"
							rows={4}
							maxLength={2000}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Gaya edit, durasi, lagu, referensi, deadline..."
							className="w-full p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] resize-none"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label
								htmlFor="request-budget-min"
								className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Budget Min (Rp)
							</label>
							<input
								id="request-budget-min"
								type="number"
								min={0}
								step={1000}
								value={budgetMin}
								onChange={(e) => setBudgetMin(e.target.value)}
								placeholder="0"
								className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>
						<div className="space-y-1.5">
							<label
								htmlFor="request-budget-max"
								className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
							>
								Budget Maks (Rp) *
							</label>
							<input
								id="request-budget-max"
								type="number"
								min={1000}
								step={1000}
								value={budgetMax}
								onChange={(e) => setBudgetMax(e.target.value)}
								placeholder="50000"
								className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
							/>
						</div>
					</div>
					{error && (
						<p className="text-xs font-semibold text-rose-400">{error}</p>
					)}
					<button
						type="button"
						disabled={submitting}
						onClick={handleSubmit}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-[var(--color-interactive-primary)] text-white text-sm font-bold disabled:opacity-50"
					>
						{submitting ? "Mengirim..." : "Kirim Request"}
					</button>
				</div>
			)}

			{/* Status tabs */}
			<div className="flex items-center gap-2">
				{STATUS_TABS.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => loadTab(t.id)}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							tab === t.id
								? "bg-[var(--color-interactive-primary)] text-white shadow-md"
								: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* List */}
			{loading ? (
				<p className="text-sm text-[var(--color-text-secondary)] px-1">
					Memuat...
				</p>
			) : requests.length === 0 ? (
				<div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-center">
					<p className="text-sm font-bold text-[var(--color-text-primary)]">
						Belum ada request
					</p>
					<p className="text-xs text-[var(--color-text-secondary)] mt-1">
						Jadilah yang pertama membuat request custom.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{requests.map((r) => (
						<Link
							key={r.id}
							href={`/requests/${r.id}`}
							className="block p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-all"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] truncate">
										{r.title}
									</h3>
									<p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
										{r.description}
									</p>
									<p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
										@{r.requester.username} • {r.offer_count} penawaran
									</p>
								</div>
								<span className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold whitespace-nowrap">
									{formatBudget(r.budget_min, r.budget_max)}
								</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
