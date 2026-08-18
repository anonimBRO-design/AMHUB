"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface FilterSheetProps {
	isOpen: boolean;
	onClose: () => void;
}

const CATEGORIES = [
	{ id: "jj-tipis", label: "JJ Tipis" },
	{ id: "jj-melar", label: "JJ Kenyat-Kenyot" },
	{ id: "jj-belah", label: "JJ Belah" },
	{ id: "anime", label: "Anime" },
	{ id: "gaming", label: "Gaming" },
	{ id: "lyric", label: "Lyric" },
	{ id: "3d", label: "3D Motion" },
	{ id: "slowmo", label: "Slow Motion" },
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const FILE_TYPES = ["xml", "qr", "link"];

export function FilterSheet({ isOpen, onClose }: FilterSheetProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		searchParams.get("category"),
	);
	const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
		searchParams.get("difficulty"),
	);
	const [selectedFileType, setSelectedFileType] = useState<string | null>(
		searchParams.get("fileType"),
	);

	if (!isOpen) return null;

	const handleApply = () => {
		const params = new URLSearchParams(searchParams.toString());

		if (selectedCategory) params.set("category", selectedCategory);
		else params.delete("category");

		if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
		else params.delete("difficulty");

		if (selectedFileType) params.set("fileType", selectedFileType);
		else params.delete("fileType");

		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
			onClose();
		});
	};

	const handleReset = () => {
		setSelectedCategory(null);
		setSelectedDifficulty(null);
		setSelectedFileType(null);
		const params = new URLSearchParams(searchParams.toString());
		params.delete("category");
		params.delete("difficulty");
		params.delete("fileType");
		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
			onClose();
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm transition-opacity">
			{/* Backdrop click */}
			<button
				type="button"
				onClick={onClose}
				aria-label="Close filter menu"
				className="absolute inset-0 cursor-default"
			/>

			{/* Sheet Container */}
			<div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] p-6 space-y-6 shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-in slide-in-from-bottom duration-200">
				{/* Handle Bar */}
				<div className="w-12 h-1.5 rounded-full bg-[var(--color-border-subtle)] mx-auto -mt-2 mb-2" />

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<SlidersHorizontal className="w-5 h-5 text-[var(--color-interactive-primary)]" />
						<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
							Filter Presets
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Category Section */}
				<div className="space-y-3">
					<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Category
					</h3>
					<div className="flex flex-wrap gap-2">
						{CATEGORIES.map((cat) => {
							const isSelected = selectedCategory === cat.id;
							return (
								<button
									key={cat.id}
									type="button"
									onClick={() =>
										setSelectedCategory(isSelected ? null : cat.id)
									}
									className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold border transition-all ${
										isSelected
											? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
											: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
									}`}
								>
									{cat.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Difficulty Section */}
				<div className="space-y-3">
					<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Difficulty
					</h3>
					<div className="flex flex-wrap gap-2">
						{DIFFICULTIES.map((diff) => {
							const isSelected = selectedDifficulty === diff;
							return (
								<button
									key={diff}
									type="button"
									onClick={() =>
										setSelectedDifficulty(isSelected ? null : diff)
									}
									className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold capitalize border transition-all ${
										isSelected
											? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
											: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
									}`}
								>
									{diff}
								</button>
							);
						})}
					</div>
				</div>

				{/* File Format Section */}
				<div className="space-y-3">
					<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Preset Format
					</h3>
					<div className="flex flex-wrap gap-2">
						{FILE_TYPES.map((ft) => {
							const isSelected = selectedFileType === ft;
							return (
								<button
									key={ft}
									type="button"
									onClick={() => setSelectedFileType(isSelected ? null : ft)}
									className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold uppercase border transition-all ${
										isSelected
											? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
											: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
									}`}
								>
									{ft}
								</button>
							);
						})}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
					<button
						type="button"
						onClick={handleReset}
						className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-semibold text-xs border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] active:scale-95 transition-all"
					>
						<RotateCcw className="w-4 h-4" />
						<span>Reset</span>
					</button>

					<button
						type="button"
						onClick={handleApply}
						className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
					>
						<Check className="w-4 h-4" />
						<span>Apply Filters</span>
					</button>
				</div>
			</div>
		</div>
	);
}
