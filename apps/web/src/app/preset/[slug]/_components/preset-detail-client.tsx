"use client";

import { useLanguage } from "@/i18n";
import { formatCategory } from "@/lib/format-category";
import type { PresetCardPreset } from "@presethub/ui";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommentSection } from "./CommentSection";
import { CreatorCard } from "./CreatorCard";
import { DescriptionSection } from "./DescriptionSection";
import { Hero } from "./Hero";
import { InstallSection } from "./InstallSection";
import { PresetStats } from "./PresetStats";
import { RelatedPresets } from "./RelatedPresets";
import { RemixCard, type RemixNodeData } from "./RemixCard";
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
    hasAccess?: boolean;
    creator: PresetCardPreset["creator"] & {
      followerCount?: number;
      presetCount?: number;
      isFollowing?: boolean;
    };
  };
  relatedPresets: PresetCardPreset[];
  comments?: CommentItem[];
  currentUserId?: string;
  remixParent?: RemixNodeData | null;
  remixChildren?: RemixNodeData[];
  remixChildrenTotal?: number;
}

export function PresetDetailClient({
  preset,
  relatedPresets,
  comments = [],
  currentUserId,
  remixParent = null,
  remixChildren = [],
  remixChildrenTotal = 0,
}: PresetDetailClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [liveCommentCount, setLiveCommentCount] = useState(
    Math.max(preset.commentCount ?? 0, comments.length),
  );

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/explore");
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Back Button & Category Breadcrumb Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.presetDetail.back}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
          <Link href="/explore" className="hover:text-white transition-colors">
            {t.presetDetail.explore}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-interactive-primary)] font-semibold">
            {formatCategory(preset.category)}
          </span>
        </div>
      </div>

      {/* Top 2-Column Responsive Layout: Media Left + Core Details & Description Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Sticky Media Showcase (Video + Reaction Bar + Quick Counters) */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-6 self-start w-full">
          <Hero
            preset={{ ...preset, commentCount: liveCommentCount }}
            currentUserId={currentUserId}
          />
        </div>

        {/* RIGHT COLUMN: Conversion Hub, Creator & Description */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 w-full min-w-0">
          {/* Preset Title & Category Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-interactive-primary)]/15 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/30 tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                {formatCategory(preset.category)}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                {t.presetDetail.alightMotionPreset}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--color-text-primary)] leading-tight">
              {preset.title}
            </h1>
          </div>

          {/* Creator Profile Card */}
          <CreatorCard creator={preset.creator} />

          {/* Primary CTA: Download & Import Section */}
          <InstallSection preset={preset} />

          {/* Preset Description - Ditukar ke atas berdampingan dengan video */}
          <DescriptionSection preset={preset} currentUserId={currentUserId} />
        </div>
      </div>

      {/* FULL-WIDTH EXPANDED SECTIONS: Memenuhi seluruh ruang kosong di bawah video */}
      <div className="space-y-6 pt-2">
        {/* Bento Grid: Performance Stats & Technical Specs (Full Width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <PresetStats
            views={preset.viewCount ?? 0}
            downloads={preset.downloadCount ?? 0}
            uniqueDownloads={preset.uniqueDownloadCount}
            likes={preset.likeCount ?? 0}
            bookmarks={preset.bookmarkCount ?? 0}
            comments={liveCommentCount}
          />
          <TagList preset={preset} />
        </div>

        {/* Remix Card (if any) */}
        <RemixCard
          parent={remixParent}
          remixes={remixChildren}
          totalChildren={remixChildrenTotal}
        />

        {/* Comments Discussion Section - Panjang penuh selebar layar! */}
        <CommentSection
          presetId={preset.id}
          initialComments={comments}
          commentCount={liveCommentCount}
          onCommentCountChange={setLiveCommentCount}
        />
      </div>

      <RelatedPresets presets={relatedPresets} category={preset.category} />
      <StickyActionBar preset={preset} />
    </div>
  );
}