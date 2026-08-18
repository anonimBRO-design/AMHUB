"use client";

import {
	Flame,
	Gamepad2,
	Layers,
	Layers3,
	Sparkles,
	Volume2,
	Waves,
	Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const CATEGORIES = [
	{ id: "all", label: "All Presets", icon: Sparkles },
	{ id: "jj", label: "JJ", icon: Zap },
	{ id: "jj-tipis", label: "JJ Tipis", icon: Sparkles },
	{ id: "jj-melar", label: "JJ Kenyat-Kenyot", icon: Flame },
	{ id: "jj-belah", label: "JJ Belah", icon: Layers },
	{ id: "jj-abstract", label: "JJ Abstract", icon: Layers3 },
	{ id: "jj-db", label: "JJ DB", icon: Volume2 },
	{ id: "jj-mekdi", label: "JJ Mekdi", icon: Flame },
	{ id: "jj-kenyal", label: "JJ Kenyal", icon: Waves },
	{ id: "gaming", label: "Gaming", icon: Gamepad2 },
];

export function CategoryScroller() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentCategory = searchParams.get("category") ?? "all";
	const [, startTransition] = useTransition();

	const handleCategoryClick = (catId: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (catId === "all") {
			params.delete("category");
		} else {
			params.set("category", catId);
		}
		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
		});
	};

	return (
		<div className="w-full relative sticky top-[80px] z-20 backdrop-blur-md bg-[var(--color-bg-base)]/80 py-2">
			<div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory py-1 px-1 scrollbar-none text-xs font-semibold select-none [-webkit-overflow-scrolling:touch]">
				{CATEGORIES.map((cat) => {
					const Icon = cat.icon;
					const isActive =
						currentCategory === cat.id ||
						(cat.id === "all" && !searchParams.has("category"));

					return (
						<button
							key={cat.id}
							type="button"
							onClick={() => handleCategoryClick(cat.id)}
							className={`snap-start shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-2xl border transition-all duration-200 active:scale-95 ${
								isActive
									? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md shadow-[var(--color-interactive-primary)]/20 scale-[1.02]"
									: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]"
							}`}
						>
							<Icon
								className={`w-4 h-4 ${
									isActive
										? "text-white animate-pulse"
										: "text-[var(--color-text-tertiary)]"
								}`}
							/>
							<span className="whitespace-nowrap">{cat.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
