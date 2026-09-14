"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n";
import {
	ExternalLink,
	MessageSquare,
	Send,
	Sparkles,
	Trash2,
	Video,
} from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

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

interface CommentSectionProps {
	presetId: string;
	initialComments?: CommentItem[];
	commentCount?: number;
	onCommentCountChange?: (count: number) => void;
}

function parseCommentContent(content: string) {
	const showcaseMatch = content.match(
		/(https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+|https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)/i,
	);
	return {
		hasShowcase: Boolean(showcaseMatch),
		showcaseUrl: showcaseMatch ? showcaseMatch[1] : null,
		cleanText: content
			.replace(/🎬\s*Showcase:\s*https?:\/\/[^\s]+/i, "")
			.trim(),
	};
}

export function CommentSection({
	presetId,
	initialComments = [],
	commentCount = 0,
	onCommentCountChange,
}: CommentSectionProps) {
	const { t, language } = useLanguage();
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const [newComment, setNewComment] = useState("");
	const [showcaseUrl, setShowcaseUrl] = useState("");
	const [showShowcaseInput, setShowShowcaseInput] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { currentUser, requireAuth } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) return;
		if (!requireAuth(undefined, t.presetDetail.signInToComment)) return;

		setIsSubmitting(true);

		const finalContent = showcaseUrl.trim()
			? `${newComment.trim()}\n\n🎬 Showcase: ${showcaseUrl.trim()}`
			: newComment.trim();

		const optimisticId = `temp-${Date.now()}`;
		const optimisticComment: CommentItem = {
			id: optimisticId,
			content: finalContent,
			createdAt: new Date().toISOString(),
			user: {
				username: currentUser?.username || "me",
				displayName:
					currentUser?.display_name || currentUser?.username || "You",
				avatarUrl: currentUser?.avatar_url,
			},
		};

		setComments((prev) => {
			const updated = [optimisticComment, ...prev];
			onCommentCountChange?.(updated.length);
			return updated;
		});
		setNewComment("");
		setShowcaseUrl("");
		setShowShowcaseInput(false);

		try {
			const response = await fetch(`/api/presets/${presetId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ body: optimisticComment.content }),
			});

			if (!response.ok) throw new Error("Failed to post comment");
			const savedComment = await response.json();

			setComments((prev) =>
				prev.map((c) =>
					c.id === optimisticId
						? {
								...c,
								id: savedComment.id,
							}
						: c,
				),
			);

			posthog.capture("preset_comment_posted", { preset_id: presetId });
		} catch (error) {
			console.error("Failed to post comment", error);
			setComments((prev) => {
				const reverted = prev.filter((c) => c.id !== optimisticId);
				onCommentCountChange?.(reverted.length);
				return reverted;
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		setComments((prev) => {
			const updated = prev.filter((c) => c.id !== commentId);
			onCommentCountChange?.(updated.length);
			return updated;
		});

		try {
			const res = await fetch(`/api/comments/${commentId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete comment");
			posthog.capture("preset_comment_deleted", { preset_id: presetId });
		} catch (error) {
			console.error("Failed to delete comment", error);
		}
	};

	return (
		<section
			id="comments-section"
			className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-5 shadow-lg"
		>
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
					<MessageSquare className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						{t.presetDetail.communityDiscussion}
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						{t.presetDetail.commentsCountHeader.replace(
							"{count}",
							String(comments.length || commentCount),
						)}
					</p>
				</div>
			</div>

			{/* Add Comment Input */}
			<form onSubmit={handleSubmit} className="space-y-2">
				<div className="flex gap-2">
					<input
						type="text"
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder={t.presetDetail.commentPlaceholder}
						aria-label={t.presetDetail.sendComment}
						className="flex-1 min-h-[42px] px-3.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
					/>
					<button
						type="submit"
						disabled={isSubmitting || !newComment.trim()}
						aria-label={t.presetDetail.sendComment}
						className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-lg bg-[var(--color-interactive-primary)] text-white font-bold text-xs disabled:opacity-50 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all shrink-0"
					>
						<Send className="w-4 h-4" />
					</button>
				</div>

				<div className="flex items-center justify-between text-xs">
					<button
						type="button"
						onClick={() => setShowShowcaseInput(!showShowcaseInput)}
						className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pink-400 hover:text-pink-300 transition-colors"
					>
						<Video className="w-3.5 h-3.5" />
						<span>{t.presetDetail.showcaseToggle}</span>
					</button>
				</div>

				{showShowcaseInput && (
					<div className="p-2.5 rounded-lg bg-[var(--color-bg-base)] border border-pink-500/30 flex items-center gap-2 animate-fade-in">
						<Video className="w-4 h-4 text-pink-400 shrink-0" />
						<input
							type="url"
							value={showcaseUrl}
							onChange={(e) => setShowcaseUrl(e.target.value)}
							placeholder="https://www.tiktok.com/@username/video/... (atau YouTube)"
							className="flex-1 bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none font-mono"
						/>
					</div>
				)}
			</form>

			{/* Comments List */}
			<div className="space-y-3 pt-2">
				{comments.length > 0 ? (
					comments.map((comment) => {
						const isOwnComment =
							currentUser && currentUser.username === comment.user.username;
						const {
							hasShowcase,
							showcaseUrl: commentShowcaseUrl,
							cleanText,
						} = parseCommentContent(comment.content);

						return (
							<div
								key={comment.id}
								className="p-3.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/60 space-y-2"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{comment.user.avatarUrl ? (
											<img
												src={comment.user.avatarUrl}
												alt={comment.user.displayName}
												className="w-5 h-5 rounded-md object-cover"
											/>
										) : (
											<div className="w-5 h-5 rounded-md bg-cyan-600/30 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
												{comment.user.displayName.slice(0, 2).toUpperCase()}
											</div>
										)}
										<span className="text-xs font-bold text-[var(--color-text-primary)]">
											{comment.user.displayName}
										</span>
										{hasShowcase && (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500/20 to-amber-500/20 text-pink-300 border border-pink-500/30 tracking-wide">
												<Sparkles className="w-3 h-3 text-amber-400" />
												{t.presetDetail.showcaseBadge}
											</span>
										)}
									</div>

									<div className="flex items-center gap-2">
										<span className="text-[10px] text-[var(--color-text-tertiary)]">
											{new Date(comment.createdAt).toLocaleDateString(
												language === "id" ? "id-ID" : "en-US",
											)}
										</span>
										{isOwnComment && (
											<button
												type="button"
												onClick={() => handleDeleteComment(comment.id)}
												className="text-[var(--color-text-tertiary)] hover:text-rose-400 p-1 rounded-md transition-colors"
												title={t.presetDetail.deleteComment}
												aria-label={t.presetDetail.deleteComment}
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										)}
									</div>
								</div>
								<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-7">
									{cleanText || comment.content}
								</p>

								{hasShowcase && commentShowcaseUrl && (
									<div className="pl-7 pt-0.5">
										<a
											href={commentShowcaseUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 border border-pink-500/20 text-xs font-bold transition-all active:scale-95 group"
										>
											<Video className="w-3.5 h-3.5" />
											<span>{t.presetDetail.watchShowcase}</span>
											<ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
										</a>
									</div>
								)}
							</div>
						);
					})
				) : (
					<div className="p-8 text-center rounded-lg bg-[var(--color-bg-base)]/40 border border-white/[0.05] space-y-2">
						<MessageSquare className="w-6 h-6 text-cyan-400 mx-auto opacity-50" />
						<p className="text-xs font-bold text-[var(--color-text-primary)]">
							{t.presetDetail.beFirstComment}
						</p>
						<p className="text-[11px] text-[var(--color-text-tertiary)]">
							{t.presetDetail.beFirstCommentDesc}
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
