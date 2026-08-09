import { Award, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface DashboardHeroProps {
	user: {
		displayName: string;
		username: string;
		avatarUrl?: string | null;
		level?: number;
		isVerified?: boolean;
		isStaff?: boolean;
	};
}

export function DashboardHero({ user }: DashboardHeroProps) {
	return (
		<div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--color-bg-elevated)] via-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-border-subtle)] shadow-2xl">
			{/* Ambient Glow */}
			<div className="absolute -top-24 -right-24 w-80 h-80 bg-[var(--color-interactive-primary)]/15 rounded-full blur-3xl pointer-events-none" />

			<div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
				<div className="flex items-center gap-4">
					<img
						src={
							user.avatarUrl ||
							`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
						}
						alt={user.displayName}
						className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]/40 shadow-xl"
					/>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)]">
								Welcome back, {user.displayName}!
							</h1>
							{(user.isVerified || user.isStaff) && (
								<ShieldCheck className="w-4 h-4 text-[var(--color-interactive-primary)] shrink-0" />
							)}
						</div>
						<div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
							<span className="font-semibold">@{user.username}</span>
							{typeof user.level === "number" && (
								<>
									<span>•</span>
									<span className="inline-flex items-center gap-1 font-bold text-purple-400">
										<Award className="w-3.5 h-3.5" /> Level {user.level} Creator
									</span>
								</>
							)}
						</div>
					</div>
				</div>

				<Link
					href="/upload"
					className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--color-interactive-primary)]/25 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all shrink-0"
				>
					<Plus className="w-4 h-4" />
					<span>Upload New Preset</span>
				</Link>
			</div>
		</div>
	);
}
