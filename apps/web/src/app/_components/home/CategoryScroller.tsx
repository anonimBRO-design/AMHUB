"use client";

import {
	Flame,
	Gamepad2,
	Layers,
	Layers3,
	Music,
	Palette,
	Sparkles,
	Tv,
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
	{ id: "velocity", label: "Velocity", icon: Flame },
	{ id: "transition", label: "Transition", icon: Zap },
	{ id: "color", label: "Color Grading", icon: Palette },
	{ id: "anime", label: "Anime", icon: Tv },
	{ id: "gaming", label: "Gaming", icon: Gamepad2 },
	{ id: "lyric", label: "Lyric", icon: Music },
	{ id: "3d", label: "3D Motion", icon: Layers3 },
	{ id: "slowmo", label: "Slow Motion", icon: Layers },
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
			<div className="flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory py-1 px-1 scrollbar-none text-xs font-semibold select-none [-webkit-overflow-scrolling:touch]">
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
							className={`snap-start shrink-0 inline-flex items-center gap-2 min-h-[52px] px-4.5 rounded-2xl transition-all duration-300 font-body select-none active:scale-[0.97] ${
								isActive
									? "bg-[var(--color-interactive-primary)] text-white border border-[var(--color-interactive-primary)] shadow-[0_0_24px_rgba(124,58,237,0.4)] scale-[1.02]"
									: "backdrop-blur-xl bg-white/[0.03] text-[var(--color-text-secondary)] border border-white/[0.08] hover:text-[var(--color-text-primary)] hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]"
							}`}
						>
							<Icon
								className={`w-4 h-4 ${
									isActive
										? "text-white animate-pulse"
										: "text-[var(--color-text-tertiary)]"
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
