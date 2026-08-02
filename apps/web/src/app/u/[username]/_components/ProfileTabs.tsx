import { Activity, FolderHeart, Grid, Info } from "lucide-react";

export type ProfileTabType = "presets" | "collections" | "activity" | "about";

interface ProfileTabsProps {
	activeTab: ProfileTabType;
	onChangeTab: (tab: ProfileTabType) => void;
	presetCount?: number;
	collectionCount?: number;
}

export function ProfileTabs({
	activeTab,
	onChangeTab,
	presetCount = 0,
	collectionCount = 0,
}: ProfileTabsProps) {
	const tabs = [
		{
			id: "presets" as const,
			label: "Presets",
			count: presetCount,
			icon: Grid,
		},
		{
			id: "collections" as const,
			label: "Collections",
			count: collectionCount,
			icon: FolderHeart,
		},
		{ id: "activity" as const, label: "Activity", icon: Activity },
		{ id: "about" as const, label: "About", icon: Info },
	];

	return (
		<div className="w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/50 backdrop-blur-md sticky top-16 z-20">
			<div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 text-xs select-none">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => onChangeTab(tab.id)}
							className={`inline-flex items-center gap-2 min-h-[44px] px-4 font-bold border-b-2 transition-all active:scale-95 whitespace-nowrap ${
								isActive
									? "text-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)]"
									: "text-[var(--color-text-tertiary)] border-transparent hover:text-[var(--color-text-secondary)]"
							}`}
						>
							<Icon
								className={`w-4 h-4 ${isActive ? "text-[var(--color-interactive-primary)]" : ""}`}
							/>
							<span>{tab.label}</span>
							{typeof tab.count === "number" && (
								<span
									className={`px-2 py-0.5 rounded-full text-[10px] ${
										isActive
											? "bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)]"
											: "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]"
									}`}
								>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
