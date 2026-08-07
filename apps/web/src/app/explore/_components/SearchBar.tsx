"use client";

import { Clock, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";

interface SearchBarProps {
	onOpenFilterSheet?: () => void;
	activeFilterCount?: number;
}

const RECENT_SEARCHES_KEY = "amhub_recent_searches";

export function SearchBar({
	onOpenFilterSheet,
	activeFilterCount = 0,
}: SearchBarProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialSearch = searchParams.get("search") ?? "";
	const [value, setValue] = useState(initialSearch);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isPending, startTransition] = useTransition();

	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	const containerRef = useRef<HTMLFormElement>(null);

	// Load recent searches from localStorage
	useEffect(() => {
		try {
			const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
			if (stored) {
				setRecentSearches(JSON.parse(stored));
			}
		} catch {
			// Ignore localStorage errors
		}
	}, []);

	// Save recent search
	const saveRecentSearch = (term: string) => {
		const trimmed = term.trim();
		if (!trimmed) return;
		try {
			const updated = [
				trimmed,
				...recentSearches.filter(
					(s) => s.toLowerCase() !== trimmed.toLowerCase(),
				),
			].slice(0, 10);
			setRecentSearches(updated);
			localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
		} catch {
			// Ignore localStorage errors
		}
	};

	const removeRecentSearch = (term: string, e: React.SyntheticEvent) => {
		e.stopPropagation();
		const updated = recentSearches.filter((s) => s !== term);
		setRecentSearches(updated);
		try {
			localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
		} catch {
			// Ignore
		}
	};

	const clearAllRecent = () => {
		setRecentSearches([]);
		try {
			localStorage.removeItem(RECENT_SEARCHES_KEY);
		} catch {
			// Ignore
		}
	};

	// Execute search query update with transition
	const executeSearch = (query: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (query.trim()) {
			params.set("search", query.trim());
			saveRecentSearch(query.trim());
		} else {
			params.delete("search");
		}
		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
		});
	};

	// Automatic debounced search on input change (250-300ms)
	const handleChange = (newVal: string) => {
		setValue(newVal);

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			executeSearch(newVal);
		}, 300);
	};

	const handleSearchSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		setShowDropdown(false);
		executeSearch(value);
	};

	const handleClear = () => {
		setValue("");
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		executeSearch("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			handleClear();
			setShowDropdown(false);
		}
	};

	// Click outside listener for dropdown
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<form
			ref={containerRef}
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
					onFocus={() => setShowDropdown(true)}
					onChange={(e) => handleChange(e.target.value)}
					onKeyDown={handleKeyDown}
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

			{/* Recent Searches Dropdown */}
			{showDropdown && recentSearches.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl backdrop-blur-2xl bg-[#0f0e14]/95 border border-white/10 shadow-2xl space-y-2 z-50">
					<div className="flex items-center justify-between px-2 pb-1 border-b border-white/[0.08]">
						<span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-1.5">
							<Clock className="w-3.5 h-3.5 text-purple-400" />
							Recent Searches
						</span>
						<button
							type="button"
							onClick={clearAllRecent}
							className="text-[11px] font-semibold text-rose-400 hover:underline"
						>
							Clear All
						</button>
					</div>

					<div className="space-y-1 max-h-48 overflow-y-auto scrollbar-none">
						{recentSearches.map((term) => (
							<div
								key={term}
								className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] text-xs font-medium text-[var(--color-text-primary)] text-left cursor-pointer transition-colors group"
							>
								<button
									type="button"
									onClick={() => {
										setValue(term);
										setShowDropdown(false);
										executeSearch(term);
									}}
									className="flex items-center gap-2 truncate flex-1 text-left bg-transparent border-0 p-0 text-inherit font-inherit cursor-pointer"
								>
									<Search className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
									<span className="truncate">{term}</span>
								</button>

								<button
									type="button"
									onClick={(e) => removeRecentSearch(term, e)}
									aria-label={`Remove recent search ${term}`}
									className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
									title="Remove search"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</form>
	);
}
