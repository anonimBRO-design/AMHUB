import {
	Code,
	Database,
	HeartHandshake,
	Layers,
	LayoutGrid,
	Package,
	Palette,
	Zap,
} from "lucide-react";

export function TechStackGrid() {
	const technologies = [
		{ name: "Next.js", desc: "App Router & SSR Framework", icon: Layers },
		{ name: "React", desc: "UI Component Library", icon: Code },
		{ name: "TypeScript", desc: "Strict End-to-End Typing", icon: Zap },
		{
			name: "Tailwind CSS",
			desc: "Design System & Utility CSS",
			icon: Palette,
		},
		{ name: "Supabase", desc: "PostgreSQL Database & Auth", icon: Database },
		{ name: "Turborepo", desc: "Monorepo Build Orchestration", icon: Package },
		{
			name: "Radix UI",
			desc: "Accessible Headless Primitives",
			icon: LayoutGrid,
		},
		{ name: "Lucide Icons", desc: "Modern Icon System", icon: HeartHandshake },
	];

	return (
		<div className="space-y-4">
			<div className="space-y-1 px-1">
				<h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">
					Core Technology Stack
				</h2>
				<p className="text-xs text-[var(--color-text-secondary)]">
					Built with modern web technologies for maximum performance and
					reliability.
				</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{technologies.map((tech) => {
					const Icon = tech.icon;
					return (
						<div
							key={tech.name}
							className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-1.5 shadow-md text-center hover:border-[var(--color-interactive-primary)]/30 transition-all"
						>
							<div className="p-2.5 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-interactive-primary)] w-fit mx-auto border border-[var(--color-border-subtle)]">
								<Icon className="w-4 h-4" />
							</div>
							<h3 className="text-xs font-extrabold text-[var(--color-text-primary)]">
								{tech.name}
							</h3>
							<p className="text-[10px] text-[var(--color-text-tertiary)] line-clamp-1">
								{tech.desc}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}
