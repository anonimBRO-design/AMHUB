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

interface CategoryDef {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryDef[] = [
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
			router.push(`/?${params.toString()}`);
		});
	};

	return (
		<div className="w-full relative">
			{/* Horizontal Scroll Container */}
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
							className={`snap-start shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md transition-all duration-300 font-body select-none active:scale-[0.97] ${
								isActive
									? "bg-[var(--color-interactive-primary)] text-white border border-[var(--color-interactive-primary)] scale-[1.02]"
									: "bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-default)]"
							}`}
						>
							<Icon
								className={`w-4 h-4 ${
									isActive ? "text-white" : "text-[var(--color-text-tertiary)]"
								}`}
							/>
							<span className="whitespace-nowrap font-medium">{cat.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
