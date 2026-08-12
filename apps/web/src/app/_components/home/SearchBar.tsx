"use client";

import {
	Flame,
	Loader2,
	Search,
	SlidersHorizontal,
	Sparkles,
	X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

export function SearchBar() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialSearch = searchParams.get("search") ?? "";
	const [value, setValue] = useState(initialSearch);
	const [isPending, startTransition] = useTransition();
	const [isFocused, setIsFocused] = useState(false);

	const handleSearchSubmit = (e: FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams(searchParams.toString());
		if (value.trim()) {
			params.set("search", value.trim());
		} else {
			params.delete("search");
		}
		startTransition(() => {
			router.push(`/?${params.toString()}`);
		});
	};

	const handleTagClick = (tag: string) => {
		setValue(tag);
		const params = new URLSearchParams(searchParams.toString());
		params.set("search", tag);
		startTransition(() => {
			router.push(`/?${params.toString()}`);
		});
	};

	const handleClear = () => {
		setValue("");
		const params = new URLSearchParams(searchParams.toString());
		params.delete("search");
		startTransition(() => {
			router.push(`/?${params.toString()}`);
		});
	};

	const popularSearches = [
		"Velocity",
		"3D Shake",
		"Anime AMV",
		"XML Code",
		"Color LUT",
	];

	return (
		<div className="w-full max-w-3xl mx-auto space-y-3">
			<form
				onSubmit={handleSearchSubmit}
				className={`relative z-20 w-full bg-[var(--color-bg-surface)] p-2 rounded-2xl border transition-all duration-300 ${
					isFocused
						? "border-[var(--color-border-accent)] ring-2 ring-[var(--color-border-accent)]/20 shadow-sm"
						: "border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] shadow-md"
				}`}
			>
				<div className="relative flex items-center min-h-[52px] px-4 gap-3">
					{isPending ? (
						<Loader2 className="w-5 h-5 text-[var(--color-interactive-primary)] animate-spin shrink-0" />
					) : (
						<Search className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0" />
					)}

					<input
						type="text"
						value={value}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onChange={(e) => setValue(e.target.value)}
						placeholder="Search Alight Motion XML, velocity, 3D shake, LUTs..."
						aria-label="Search presets"
						className="w-full bg-transparent text-sm sm:text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none font-body font-medium"
					/>

					{value ? (
						<button
							type="button"
							onClick={handleClear}
							aria-label="Clear search query"
							className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-surface)] active:scale-95 transition-all duration-200 cursor-pointer"
						>
							<X className="w-4 h-4" />
						</button>
					) : (
						<kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg">
							⌘K
						</kbd>
					)}
				</div>
			</form>

			{/* Popular Quick Filter Pills */}
			<div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1 text-xs select-none">
				<span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-tertiary)] shrink-0 flex items-center gap-1 pr-1">
					<Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
					Popular:
				</span>
				{popularSearches.map((tag) => (
					<button
						key={tag}
						type="button"
						onClick={() => handleTagClick(tag)}
						className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-white hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-border-default)] active:scale-95 transition-all duration-200"
					>
						{tag}
					</button>
				))}
			</div>
		</div>
	);
}
