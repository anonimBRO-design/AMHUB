"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { CommentSection } from "./CommentSection";
import { CreatorCard } from "./CreatorCard";
import { Hero } from "./Hero";
import { InstallSection } from "./InstallSection";
import { RelatedPresets } from "./RelatedPresets";
import { StickyActionBar } from "./StickyActionBar";
import { TagList } from "./TagList";

interface PresetDetailClientProps {
	preset: PresetCardPreset & {
		fileType?: string;
		fileUrl?: string | null;
		amLink?: string | null;
	};
	relatedPresets: PresetCardPreset[];
}

export function PresetDetailClient({
	preset,
	relatedPresets,
}: PresetDetailClientProps) {
	return (
		<div className="space-y-8 pb-24 sm:pb-12 max-w-5xl mx-auto">
			{/* Hero Preview Section */}
			<Hero preset={preset} />

			{/* Main Two-Column Layout (Mobile Stack, Desktop Grid) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
				{/* Left / Main Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Download & 1-Tap Import Section */}
					<InstallSection preset={preset} />

					{/* Metadata & Tag List */}
					<TagList preset={preset} />

					{/* Community Discussion / Comments */}
					<CommentSection
						presetId={preset.id}
						commentCount={preset.commentCount}
					/>
				</div>

				{/* Right / Sidebar Column */}
				<div className="space-y-6">
					{/* Creator Card */}
					<CreatorCard creator={preset.creator} />
				</div>
			</div>

			{/* Related Presets Recommendations Feed */}
			<RelatedPresets presets={relatedPresets} category={preset.category} />

			{/* Mobile Sticky Bottom Action Bar (Thumb-reachable) */}
			<StickyActionBar preset={preset} />
		</div>
	);
}
