import { ExternalLink, FolderPlus, Plus, UserCheck } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
	username: string;
}

export function QuickActions({ username }: QuickActionsProps) {
	const actions = [
		{
			label: "Upload Preset",
			description: "Publish XML, QR, or link presets",
			href: "/upload",
			icon: Plus,
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
		},
		{
			label: "Create Collection",
			description: "Bundle presets into playlists",
			href: "/dashboard#collections",
			icon: FolderPlus,
			color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
		},
		{
			label: "Edit Profile",
			description: "Update bio, social links & avatar",
			href: "/settings",
			icon: UserCheck,
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		},
		{
			label: "Public Profile",
			description: "View your profile as visitors see it",
			href: `/u/${username}`,
			icon: ExternalLink,
			color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
			{actions.map((action) => {
				const Icon = action.icon;
				return (
					<Link
						key={action.label}
						href={action.href}
						className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-2 hover:border-[var(--color-interactive-primary)]/40 transition-all hover:shadow-lg active:scale-95 group"
					>
						<div className="flex items-center justify-between">
							<div className={`p-2.5 rounded-2xl border ${action.color}`}>
								<Icon className="w-5 h-5" />
							</div>
						</div>
						<div>
							<h4 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors">
								{action.label}
							</h4>
							<p className="text-xs text-[var(--color-text-tertiary)] line-clamp-1">
								{action.description}
							</p>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
