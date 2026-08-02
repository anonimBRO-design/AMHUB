"use client";

import { Loader2, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

export function SearchBar() {
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

	return (
		<form
			onSubmit={handleSearchSubmit}
			className="sticky top-16 z-30 w-full max-w-2xl mx-auto backdrop-blur-md bg-[var(--color-bg-surface)]/90 p-1.5 rounded-2xl border border-[var(--color-border-subtle)] shadow-xl transition-all duration-200 focus-within:border-[var(--color-interactive-primary)] focus-within:ring-2 focus-within:ring-[var(--color-interactive-primary)]/20"
		>
			<div className="relative flex items-center min-h-[48px] px-3.5 gap-3">
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
					aria-label="Search presets"
					className="w-full bg-transparent text-sm sm:text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none font-normal"
				/>

				{value && (
					<button
						type="button"
						onClick={handleClear}
						aria-label="Clear search query"
						className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] active:scale-90 transition-all duration-150"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>
		</form>
	);
}
