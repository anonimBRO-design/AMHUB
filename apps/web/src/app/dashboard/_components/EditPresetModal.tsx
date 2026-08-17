"use client";

import { Loader2, X } from "lucide-react";
import posthog from "posthog-js";
import { type FormEvent, useState } from "react";

interface PresetItem {
	id: string;
	title: string;
	description?: string | null;
	category: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	tags: string[];
	status: "pending" | "published" | "rejected" | "removed";
	price?: number;
	is_paid?: boolean;
	currency?: string;
}

interface EditPresetModalProps {
	preset: PresetItem | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const CATEGORIES = [
	{ label: "Transitions", value: "transitions" },
	{ label: "Effects", value: "effects" },
	{ label: "Text Animations", value: "text-animations" },
	{ label: "Color Grading", value: "color-grading" },
	{ label: "Overlays", value: "overlays" },
	{ label: "Velocity & Shake", value: "velocity-shake" },
	{ label: "3D Motion", value: "3d-motion" },
	{ label: "Audio Sync", value: "audio-sync" },
];

export function EditPresetModal({
	preset,
	isOpen,
	onClose,
	onSuccess,
}: EditPresetModalProps) {
	const [title, setTitle] = useState(preset?.title || "");
	const [description, setDescription] = useState(preset?.description || "");
	const [category, setCategory] = useState(preset?.category || "transitions");
	const [difficulty, setDifficulty] = useState<
		"beginner" | "intermediate" | "advanced"
	>(preset?.difficulty || "beginner");
	const [status, setStatus] = useState<
		"pending" | "published" | "rejected" | "removed"
	>(preset?.status || "published");
	const [tags, setTags] = useState(preset?.tags?.join(", ") || "");
	const [isPaid, setIsPaid] = useState(preset?.is_paid || false);
	const [price, setPrice] = useState(preset?.price || 0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Sync fields when preset changes
	if (preset && preset.id && !isSubmitting) {
		if (preset.title !== title && title === "") {
			setTitle(preset.title);
			setDescription(preset.description || "");
			setCategory(preset.category);
			setDifficulty(preset.difficulty);
			setStatus(preset.status);
			setTags(preset.tags?.join(", ") || "");
			setIsPaid(preset.is_paid || false);
			setPrice(preset.price || 0);
		}
	}

	if (!isOpen || !preset) return null;

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!preset) return;
		setIsSubmitting(true);
		setError(null);

		if (isPaid && (price < 1000 || Number.isNaN(price))) {
			setError("Harga preset berbayar minimal Rp 1.000.");
			setIsSubmitting(false);
			return;
		}

		try {
			const tagArray = tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);

			const res = await fetch(`/api/presets/${preset.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim() || undefined,
					category,
					difficulty,
					status,
					tags: tagArray,
					is_paid: isPaid,
					price: isPaid ? price : 0,
					currency: "IDR",
				}),
			});

			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.error || "Failed to update preset");
			}

			posthog.capture("preset_updated", {
				preset_id: preset.id,
				category,
				difficulty,
				status,
				is_paid: isPaid,
				price: isPaid ? price : 0,
			});
			onSuccess();
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
			<div className="w-full max-w-lg rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 space-y-6 shadow-2xl relative">
				<button
					type="button"
					onClick={onClose}
					className="absolute top-5 right-5 p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all"
				>
					<X className="w-5 h-5" />
				</button>

				<div>
					<h2 className="text-xl font-bold text-[var(--color-text-primary)]">
						Edit Preset Details
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						Update preset info, category, and publication status.
					</p>
				</div>

				{error && (
					<div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4 text-xs">
					<div className="space-y-1.5">
						<label
							htmlFor="edit-preset-title"
							className="font-bold text-[var(--color-text-primary)]"
						>
							Title
						</label>
						<input
							id="edit-preset-title"
							type="text"
							required
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-4 py-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none transition-all text-[var(--color-text-primary)] font-medium"
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="edit-preset-description"
							className="font-bold text-[var(--color-text-primary)]"
						>
							Description
						</label>
						<textarea
							id="edit-preset-description"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full px-4 py-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none transition-all text-[var(--color-text-primary)] font-medium resize-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label
								htmlFor="edit-preset-category"
								className="font-bold text-[var(--color-text-primary)]"
							>
								Category
							</label>
							<select
								id="edit-preset-category"
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="w-full px-3 py-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none transition-all text-[var(--color-text-primary)] font-medium"
							>
								{CATEGORIES.map((c) => (
									<option key={c.value} value={c.value}>
										{c.label}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="edit-preset-difficulty"
								className="font-bold text-[var(--color-text-primary)]"
							>
								Difficulty
							</label>
							<select
								id="edit-preset-difficulty"
								value={difficulty}
								onChange={(e) =>
									setDifficulty(
										e.target.value as "beginner" | "intermediate" | "advanced",
									)
								}
								className="w-full px-3 py-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none transition-all text-[var(--color-text-primary)] font-medium capitalize"
							>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label
								htmlFor="edit-preset-status"
								className="font-bold text-[var(--color-text-primary)]"
							>
								Status (Draft Workflow)
							</label>
							<select
								id="edit-preset-status"
								value={status}
								onChange={(e) =>
									setStatus(
										e.target.value as
											| "pending"
											| "published"
											| "rejected"
											| "removed",
									)
								}
								className="w-full px-3 py-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none transition-all text-[var(--color-text-primary)] font-medium"
							>
								<option value="published">Published</option>
								<option value="pending">Draft (Pending)</option>
								<option value="removed">Archived (Removed)</option>
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="edit-preset-tags"
								className="font-bold text-[var(--color-text-primary)]"
							>
								Tags (comma separated)
							</label>
							<input
								id="edit-preset-tags"
								type="text"
								value={tags}
								placeholder="xml, alightmotion, shake"
								onChange={(e) => setTags(e.target.value)}
								className="w-full px-4 py-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] outline-none transition-all text-[var(--color-text-primary)] font-medium"
							/>
						</div>
					</div>

					{/* Pricing Options */}
					<div className="space-y-2 pt-1">
						<label className="font-bold text-[var(--color-text-primary)] block">
							Preset Pricing
						</label>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => {
									setIsPaid(false);
									setPrice(0);
								}}
								className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all ${
									!isPaid
										? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-sm"
										: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
								}`}
							>
								Gratis (Free)
							</button>
							<button
								type="button"
								onClick={() => {
									setIsPaid(true);
									if (price <= 0) setPrice(10000);
								}}
								className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all ${
									isPaid
										? "bg-amber-500 text-amber-950 border-amber-500 shadow-sm"
										: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
								}`}
							>
								Berbayar (Paid)
							</button>
						</div>

						{isPaid && (
							<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-amber-500/30 space-y-2 mt-2">
								<div className="flex items-center justify-between text-[11px]">
									<span className="font-bold text-[var(--color-text-secondary)]">
										Price (IDR)
									</span>
									<span className="text-amber-400 font-semibold">
										Min Rp 1.000 (90% revenue to creator)
									</span>
								</div>
								<div className="relative">
									<span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[var(--color-text-secondary)]">
										Rp
									</span>
									<input
										type="number"
										min={1000}
										max={10000000}
										step={1000}
										value={price || ""}
										onChange={(e) => setPrice(Number(e.target.value) || 0)}
										placeholder="10000"
										className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
									/>
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="px-4 py-2 rounded-2xl text-[var(--color-text-secondary)] font-semibold hover:bg-[var(--color-bg-elevated)] transition-all"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-5 py-2 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold hover:opacity-90 transition-all flex items-center gap-2"
						>
							{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
