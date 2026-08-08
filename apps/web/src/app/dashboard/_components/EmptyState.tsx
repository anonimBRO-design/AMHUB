import { BarChart3, Download, Sparkles, Users } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
	type: "presets" | "analytics" | "downloads" | "followers";
	title?: string;
	description?: string;
	actionHref?: string;
	actionLabel?: string;
}

export function EmptyState({
	type,
	title,
	description,
	actionHref,
	actionLabel,
}: EmptyStateProps) {
	const config = {
		presets: {
			icon: Sparkles,
			color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
			defaultTitle: "No Presets Created Yet",
			defaultDescription:
				"Start sharing your Alight Motion XML, QR, and link presets with the community.",
			defaultActionHref: "/upload",
			defaultActionLabel: "Upload Your First Preset",
		},
		analytics: {
			icon: BarChart3,
			color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
			defaultTitle: "No Analytics Data Yet",
			defaultDescription:
				"Analytics will automatically appear here once users view, like, or download your presets.",
			defaultActionHref: "/upload",
			defaultActionLabel: "Publish More Content",
		},
		downloads: {
			icon: Download,
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
			defaultTitle: "No Downloads Registered",
			defaultDescription:
				"Your uploaded presets haven't received downloads yet. Share your profile link to get noticed!",
			defaultActionHref: "/upload",
			defaultActionLabel: "Create New Preset",
		},
		followers: {
			icon: Users,
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
			defaultTitle: "No Followers Yet",
			defaultDescription:
				"Engage with the community and post high quality presets to build your creator audience.",
			defaultActionHref: "/explore",
			defaultActionLabel: "Explore Community",
		},
	}[type];

	const Icon = config.icon;

	return (
		<div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-sm">
			<div className={`p-4 rounded-2xl border ${config.color} w-fit mx-auto`}>
				<Icon className="w-8 h-8" />
			</div>

			<div className="space-y-1 max-w-sm">
				<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
					{title || config.defaultTitle}
				</h3>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					{description || config.defaultDescription}
				</p>
			</div>

			{(actionHref || config.defaultActionHref) && (
				<Link
					href={actionHref || config.defaultActionHref}
					className="px-5 py-2.5 rounded-2xl bg-[var(--color-interactive-primary)] text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
				>
					{actionLabel || config.defaultActionLabel}
				</Link>
			)}
		</div>
	);
}
