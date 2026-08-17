"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommentSection } from "./CommentSection";
import { CreatorCard } from "./CreatorCard";
import { Hero } from "./Hero";
import { InstallSection } from "./InstallSection";
import { RelatedPresets } from "./RelatedPresets";
import { StickyActionBar } from "./StickyActionBar";
import { TagList } from "./TagList";

interface CommentItem {
	id: string;
	content: string;
	createdAt: string;
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string | null;
	};
}

interface PresetDetailClientProps {
	preset: PresetCardPreset & {
		fileType?: string;
		fileUrl?: string | null;
		amLink?: string | null;
		isLiked?: boolean;
		isBookmarked?: boolean;
		creator: PresetCardPreset["creator"] & {
			followerCount?: number;
			presetCount?: number;
			isFollowing?: boolean;
		};
	};
	relatedPresets: PresetCardPreset[];
	comments?: CommentItem[];
	currentUserId?: string;
}

export function PresetDetailClient({
	preset,
	relatedPresets,
	comments = [],
	currentUserId,
}: PresetDetailClientProps) {
	const router = useRouter();

	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back();
		} else {
			router.push("/explore");
		}
	};

	return (
		<div className="space-y-6 pb-24 sm:pb-12 max-w-5xl mx-auto px-4 sm:px-0">
			{/* Back Button & Category Breadcrumb Bar */}
			<div className="flex items-center justify-between pt-1">
				<button
					type="button"
					onClick={handleBack}
					className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-white transition-all active:scale-95 shadow-sm"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back</span>
				</button>

				<div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
					<Link href="/explore" className="hover:text-white transition-colors">
						Explore
					</Link>
					<span>/</span>
					<span className="text-[var(--color-interactive-primary)] font-semibold capitalize">
						{preset.category}
					</span>
				</div>
			</div>

			<Hero preset={preset} currentUserId={currentUserId} />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
				<div className="lg:col-span-2 space-y-6">
					<InstallSection preset={preset} />
					<TagList preset={preset} />
					<CommentSection
						presetId={preset.id}
						initialComments={comments}
						commentCount={comments.length || preset.commentCount}
					/>
				</div>

				<div className="space-y-6">
					<CreatorCard creator={preset.creator} />
				</div>
			</div>

			<RelatedPresets presets={relatedPresets} category={preset.category} />
			<StickyActionBar preset={preset} />
		</div>
	);
}
