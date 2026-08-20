"use client";

import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckCircle2, Flag, X } from "lucide-react";
import { useState } from "react";

interface ReportPresetModalProps {
	presetId: string;
	presetTitle: string;
	isOpen: boolean;
	onClose: () => void;
}

const REPORT_REASONS = [
	{
		id: "reupload",
		label: "Reupload / Hak Cipta",
		description: "Preset ini diambil atau diunggah ulang tanpa izin pembuat asli.",
	},
	{
		id: "broken",
		label: "Link / File Rusak",
		description: "Link Alight Motion mati, atau file XML tidak bisa di-import.",
	},
	{
		id: "nsfw",
		label: "Konten Tidak Pantas",
		description: "Mengandung gambar, teks, atau media tidak senonoh.",
	},
	{
		id: "spam",
		label: "Spam / Menyesatkan",
		description: "Judul atau thumbnail palsu tidak sesuai dengan isi preset.",
	},
	{
		id: "other",
		label: "Lainnya",
		description: "Masalah lain yang melanggar ketentuan komunitas AMHUB.",
	},
];

export function ReportPresetModal({
	presetId,
	presetTitle,
	isOpen,
	onClose,
}: ReportPresetModalProps) {
	const { requireAuth } = useAuth();
	const [reason, setReason] = useState("reupload");
	const [details, setDetails] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!requireAuth(undefined, "Masuk untuk melaporkan preset")) return;

		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch(`/api/presets/${presetId}/report`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason, details: details.trim() || undefined }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || "Gagal mengirim laporan");
			}

			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				onClose();
			}, 2500);
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Terjadi kesalahan saat melaporkan",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
			onClick={() => !isLoading && onClose()}
		>
			<div
				className="relative w-full max-w-md rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-5"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
							<Flag className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base font-bold text-[var(--color-text-primary)]">
								Laporkan Preset
							</h3>
							<p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[240px]">
								{presetTitle}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-white hover:bg-[var(--color-bg-elevated)] transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{isSuccess ? (
					<div className="py-6 text-center space-y-3">
						<div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
							<CheckCircle2 className="w-6 h-6" />
						</div>
						<h4 className="text-base font-bold text-[var(--color-text-primary)]">
							Laporan Terkirim!
						</h4>
						<p className="text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
							Terima kasih atas kontribusimu menjaga komunitas AMHUB tetap aman dan berkualitas.
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="block text-xs font-bold text-[var(--color-text-primary)]">
								Alasan Pelaporan
							</label>
							<div className="space-y-1.5">
								{REPORT_REASONS.map((r) => (
									<label
										key={r.id}
										className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
											reason === r.id
												? "bg-rose-500/10 border-rose-500/40 text-[var(--color-text-primary)]"
												: "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
										}`}
									>
										<input
											type="radio"
											name="report-reason"
											value={r.id}
											checked={reason === r.id}
											onChange={() => setReason(r.id)}
											className="mt-0.5 accent-rose-500"
										/>
										<div className="text-xs space-y-0.5">
											<div className="font-bold text-[var(--color-text-primary)]">
												{r.label}
											</div>
											<div className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
												{r.description}
											</div>
										</div>
									</label>
								))}
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="block text-xs font-bold text-[var(--color-text-primary)]">
								Detail Tambahan (Opsional)
							</label>
							<textarea
								value={details}
								onChange={(e) => setDetails(e.target.value)}
								placeholder="Sebutkan link asli atau keterangan pendukung..."
								rows={3}
								maxLength={500}
								className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-rose-500/50 resize-none font-sans"
							/>
						</div>

						{error && (
							<div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
								<AlertTriangle className="w-4 h-4 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="flex items-center gap-3 pt-2">
							<button
								type="button"
								onClick={onClose}
								disabled={isLoading}
								className="flex-1 min-h-[42px] rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={isLoading}
								className="flex-1 min-h-[42px] rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-rose-500/25 flex items-center justify-center gap-2"
							>
								{isLoading ? "Mengirim..." : "Kirim Laporan"}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
