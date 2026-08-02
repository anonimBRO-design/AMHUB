"use client";

import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

interface SearchBarProps {
	onOpenFilterSheet?: () => void;
	activeFilterCount?: number;
}

export function SearchBar({
	onOpenFilterSheet,
	activeFilterCount = 0,
}: SearchBarProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialSearch = searchParams.get("search") ?? "";
	const [value, setValue] = useState(initialSearch);
	const [isPending, startTransition] = useTransition();

	const handleSearchSubmit = (e: FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams(searchParams.toString());
		if (value.trim()) {
			params.set("search", value.trim());
		} else {
			params.delete("search");
		}
		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
		});
	};

	const handleClear = () => {
		setValue("");
		const params = new URLSearchParams(searchParams.toString());
		params.delete("search");
		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
		});
	};

	return (
		<form
			onSubmit={handleSearchSubmit}
			className="sticky top-16 z-30 w-full backdrop-blur-xl bg-[var(--color-bg-surface)]/90 p-1.5 rounded-2xl border border-[var(--color-border-subtle)] shadow-xl transition-all focus-within:border-[var(--color-interactive-primary)] focus-within:ring-2 focus-within:ring-[var(--color-interactive-primary)]/20"
		>
			<div className="relative flex items-center min-h-[48px] px-3 gap-2.5">
				{isPending ? (
					<Loader2 className="w-5 h-5 text-[var(--color-interactive-primary)] animate-spin shrink-0" />
				) : (
					<Search className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0" />
				)}

				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Search Alight Motion presets, XML, velocity..."
					aria-label="Search catalog"
					className="w-full bg-transparent text-xs sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
				/>

				{value && (
					<button
						type="button"
						onClick={handleClear}
						aria-label="Clear search query"
						className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-90 transition-all"
					>
						<X className="w-4 h-4" />
					</button>
				)}

				{onOpenFilterSheet && (
					<button
						type="button"
						onClick={onOpenFilterSheet}
						aria-label="Open filter options"
						className="relative inline-flex items-center justify-center min-h-[38px] px-3 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] active:scale-95 transition-all text-xs font-semibold shrink-0"
					>
						<SlidersHorizontal className="w-4 h-4" />
						<span className="hidden sm:inline ml-1.5">Filters</span>
						{activeFilterCount > 0 && (
							<span className="absolute -top-1 -right-1 min-w-[18px] min-h-[18px] px-1 rounded-full bg-[var(--color-interactive-primary)] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
								{activeFilterCount}
							</span>
						)}
					</button>
				)}
			</div>
		</form>
	);
}
