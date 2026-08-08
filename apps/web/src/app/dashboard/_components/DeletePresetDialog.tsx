"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeletePresetDialogProps {
	preset: { id: string; title: string } | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function DeletePresetDialog({
	preset,
	isOpen,
	onClose,
	onSuccess,
}: DeletePresetDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isOpen || !preset) return null;

	async function handleDelete() {
		if (!preset) return;
		setIsDeleting(true);
		setError(null);

		try {
			const res = await fetch(`/api/presets/${preset.id}`, {
				method: "DELETE",
			});

			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.error || "Failed to delete preset");
			}

			onSuccess();
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
			<div className="w-full max-w-md rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 space-y-5 shadow-2xl relative">
				<div className="flex items-center gap-3 text-rose-500">
					<div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
						<AlertTriangle className="w-6 h-6" />
					</div>
					<div>
						<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
							Delete Preset
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)]">
							This action cannot be undone.
						</p>
					</div>
				</div>

				<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
					Are you sure you want to permanently delete{" "}
					<strong className="text-[var(--color-text-primary)]">
						"{preset.title}"
					</strong>
					? This will permanently erase the database record and purge all
					associated storage assets (thumbnail, preview video, XML file, QR
					image) to ensure no orphaned files remain.
				</p>

				{error && (
					<div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
						{error}
					</div>
				)}

				<div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)] text-xs">
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						className="px-4 py-2.5 rounded-2xl text-[var(--color-text-secondary)] font-semibold hover:bg-[var(--color-bg-elevated)] transition-all"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isDeleting}
						className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all flex items-center gap-2 shadow-md shadow-rose-500/20"
					>
						{isDeleting ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Trash2 className="w-4 h-4" />
						)}
						Confirm Delete
					</button>
				</div>
			</div>
		</div>
	);
}
