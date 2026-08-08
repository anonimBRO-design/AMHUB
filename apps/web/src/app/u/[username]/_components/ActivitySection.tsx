import {
	Activity,
	Award,
	Bookmark,
	Download,
	Heart,
	MessageCircle,
	Upload,
	UserPlus,
} from "lucide-react";

export interface ActivityItem {
	id: string;
	type:
		| "like"
		| "comment"
		| "follow"
		| "download"
		| "system"
		| "preset_published";
	message: string;
	presetTitle?: string | null;
	actorName?: string | null;
	createdAt: string;
}

interface ActivitySectionProps {
	activities: ActivityItem[];
}

const ACTIVITY_CONFIG: Record<
	ActivityItem["type"],
	{ icon: typeof Activity; color: string }
> = {
	preset_published: {
		icon: Upload,
		color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
	},
	like: {
		icon: Heart,
		color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
	},
	comment: {
		icon: MessageCircle,
		color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
	},
	follow: {
		icon: UserPlus,
		color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
	},
	download: {
		icon: Download,
		color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
	},
	system: {
		icon: Award,
		color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
	},
};

function formatRelativeTime(dateString: string): string {
	const now = new Date();
	const date = new Date(dateString);
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = Math.floor(diffDays / 30);

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffWeeks < 5) return `${diffWeeks}w ago`;
	return `${diffMonths}mo ago`;
}

export function ActivitySection({ activities }: ActivitySectionProps) {
	if (activities.length === 0) {
		return (
			<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
				<div className="flex items-center gap-2">
					<Activity className="w-4 h-4 text-purple-400" />
					<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
						Recent Activity
					</h3>
				</div>
				<div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
					<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
						<Activity className="w-5 h-5" />
					</div>
					<p className="text-xs text-[var(--color-text-tertiary)]">
						No activity yet
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center gap-2">
				<Activity className="w-4 h-4 text-purple-400" />
				<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
					Recent Activity
				</h3>
			</div>

			<div className="space-y-3 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--color-border-subtle)]">
				{activities.map((act) => {
					const config = ACTIVITY_CONFIG[act.type] ?? ACTIVITY_CONFIG.system;
					const Icon = config.icon;
					return (
						<div
							key={act.id}
							className="relative flex items-start gap-3.5 pl-2"
						>
							<div
								className={`p-2 rounded-xl border ${config.color} relative z-10 shrink-0`}
							>
								<Icon className="w-3.5 h-3.5" />
							</div>
							<div className="space-y-0.5 min-w-0">
								<h4 className="text-xs font-bold text-[var(--color-text-primary)]">
									{act.message}
								</h4>
								{act.presetTitle && (
									<p className="text-xs text-[var(--color-text-secondary)]">
										{act.presetTitle}
									</p>
								)}
								<span className="text-[10px] text-[var(--color-text-tertiary)] block">
									{formatRelativeTime(act.createdAt)}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
