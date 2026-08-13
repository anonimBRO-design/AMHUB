"use client";

import {
	Flame,
	Gamepad2,
	Layers,
	Layers3,
	Music,
	Palette,
	Tv,
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
}

const CATEGORIES = [
	{ id: "velocity", label: "Velocity", icon: Flame },
	{ id: "transition", label: "Transition", icon: Zap },
	{ id: "color", label: "Color Grading", icon: Palette },
	{ id: "anime", label: "Anime", icon: Tv },
	{ id: "gaming", label: "Gaming", icon: Gamepad2 },
	{ id: "lyric", label: "Lyric", icon: Music },
	{ id: "3d", label: "3D Motion", icon: Layers3 },
	{ id: "slowmo", label: "Slow Motion", icon: Layers },
	{ id: "jj", label: "JJ", icon: Zap },
];

const DIFFICULTIES = [
	{ id: "beginner" as const, label: "Beginner" },
	{ id: "intermediate" as const, label: "Intermediate" },
	{ id: "advanced" as const, label: "Advanced" },
];

export function DetailsStep({
	title,
	onTitleChange,
	description,
	onDescriptionChange,
	category,
	onCategoryChange,
	difficulty,
	onDifficultyChange,
}: DetailsStepProps) {
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
		</div>
	);
}
