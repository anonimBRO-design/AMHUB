import {
	Calendar,
	CheckCircle2,
	Globe,
	Instagram,
	Share2,
	ShieldCheck,
	Youtube,
} from "lucide-react";

interface HeroProps {
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string | null;
		bannerUrl?: string | null;
		bio?: string | null;
		isVerified?: boolean;
		websiteUrl?: string | null;
		tiktokHandle?: string | null;
		instagramHandle?: string | null;
		youtubeUrl?: string | null;
		createdAt?: string;
	};
}

export function Hero({ user }: HeroProps) {
	const joinDateFormatted = user.createdAt
		? new Date(user.createdAt).toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
			})
		: "Member";

	return (
		<div className="relative overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl min-h-[220px]">
			{/* Full Hero Cover Background Layer */}
			{user.bannerUrl ? (
				<>
					<img
						src={user.bannerUrl}
						alt={`${user.displayName}'s profile banner`}
						className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-[var(--color-bg-surface)]/95 z-0 pointer-events-none" />
				</>
			) : (
				<>
					<div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-violet-900/60 z-0 pointer-events-none" />
					<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[var(--color-bg-surface)]/90 z-0 pointer-events-none" />
					<div className="absolute -top-12 -left-12 w-64 h-64 bg-[var(--color-interactive-primary)]/20 rounded-full blur-3xl pointer-events-none z-0" />
				</>
			)}

			{/* Profile Info Content Layer */}
			<div className="relative z-10 p-5 sm:p-6 space-y-4">
				{/* Avatar & Header Row */}
				<div className="flex items-end justify-between gap-4">
					<div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-full aspect-square">
						<img
							src={
								user.avatarUrl ||
								`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
							}
							alt={user.displayName}
							className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[var(--color-bg-surface)] bg-[var(--color-bg-elevated)] shadow-2xl block shrink-0"
							style={{
								objectFit: "cover",
								maxWidth: "100%",
								maxHeight: "100%",
							}}
						/>
						{user.isVerified && (
							<div className="absolute bottom-1 right-1 p-1 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-lg z-10">
								<CheckCircle2 className="w-4 h-4 fill-current" />
							</div>
						)}
					</div>
				</div>

				{/* Identity Info */}
				<div className="space-y-2">
					<div className="flex items-center gap-2 flex-wrap">
						<h1 className="text-xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
							{user.displayName}
						</h1>
						{user.isVerified && (
							<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
								<ShieldCheck className="w-3 h-3" />
								<span>Verified Creator</span>
							</span>
						)}
					</div>
					<p className="text-xs sm:text-sm font-semibold text-[var(--color-text-tertiary)]">
						@{user.username}
					</p>
				</div>

				{/* Bio */}
				{user.bio && (
					<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
						{user.bio}
					</p>
				)}

				{/* Meta details & Social links */}
				<div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-tertiary)] pt-2 border-t border-[var(--color-border-subtle)]/60">
					<div className="flex items-center gap-1.5">
						<Calendar className="w-3.5 h-3.5" />
						<span>Joined {joinDateFormatted}</span>
					</div>

					{user.websiteUrl && (
						<a
							href={user.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-[var(--color-interactive-primary)] hover:underline"
						>
							<Globe className="w-3.5 h-3.5" />
							<span className="truncate max-w-[150px]">Website</span>
						</a>
					)}

					{user.instagramHandle && (
						<a
							href={`https://instagram.com/${user.instagramHandle.replace("@", "")}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-rose-400 hover:underline"
						>
							<Instagram className="w-3.5 h-3.5" />
							<span>{user.instagramHandle}</span>
						</a>
					)}

					{user.youtubeUrl && (
						<a
							href={user.youtubeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-red-400 hover:underline"
						>
							<Youtube className="w-3.5 h-3.5" />
							<span>YouTube</span>
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
