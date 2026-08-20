"use client";

import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send, Trash2 } from "lucide-react";
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
}

export function CommentSection({
	presetId,
	initialComments = [],
	commentCount = 0,
}: CommentSectionProps) {
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const [newComment, setNewComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { currentUser, requireAuth } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) return;
		if (!requireAuth(undefined, "Sign in to leave a comment")) return;

		setIsSubmitting(true);

		const optimisticId = `temp-${Date.now()}`;
		const optimisticComment: CommentItem = {
			id: optimisticId,
			content: newComment,
			createdAt: new Date().toISOString(),
			user: {
				username: currentUser?.username || "me",
				displayName: currentUser?.displayName || "You",
				avatarUrl: currentUser?.avatarUrl,
			},
		};

		setComments((prev) => [optimisticComment, ...prev]);
		setNewComment("");

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
			setComments((prev) => prev.filter((c) => c.id !== optimisticId));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		setComments((prev) => prev.filter((c) => c.id !== commentId));

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
						Komentar
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						{comments.length || commentCount} Komentar
					</p>
				</div>
			</div>

			{/* Add Comment Input */}
			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder="Tulis komentar atau tanya preset ini..."
					aria-label="Add a comment"
					className="flex-1 min-h-[42px] px-3.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
				/>
				<button
					type="submit"
					disabled={isSubmitting || !newComment.trim()}
					className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-lg bg-[var(--color-interactive-primary)] text-white font-bold text-xs disabled:opacity-50 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all shrink-0"
				>
					<Send className="w-4 h-4" />
				</button>
			</form>

			{/* Comments List */}
			<div className="space-y-3 pt-2">
				{comments.length > 0 ? (
					comments.map((comment) => {
						const isOwnComment =
							currentUser && currentUser.username === comment.user.username;

						return (
							<div
								key={comment.id}
								className="p-3.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/60 space-y-1.5"
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
											<div className="w-5 h-5 rounded-md bg-purple-600/30 text-purple-300 font-bold text-[10px] flex items-center justify-center">
												{comment.user.displayName.slice(0, 2).toUpperCase()}
											</div>
										)}
										<span className="text-xs font-bold text-[var(--color-text-primary)]">
											{comment.user.displayName}
										</span>
									</div>

									<div className="flex items-center gap-2">
										<span className="text-[10px] text-[var(--color-text-tertiary)]">
											{new Date(comment.createdAt).toLocaleDateString()}
										</span>
										{isOwnComment && (
											<button
												type="button"
												onClick={() => handleDeleteComment(comment.id)}
												className="text-[var(--color-text-tertiary)] hover:text-rose-400 p-1 rounded-md transition-colors"
												title="Delete comment"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										)}
									</div>
								</div>
								<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-7">
									{comment.content}
								</p>
							</div>
						);
					})
				) : (
					<div className="p-8 text-center rounded-lg bg-[var(--color-bg-base)]/40 border border-white/[0.05] space-y-2">
						<MessageSquare className="w-6 h-6 text-purple-400 mx-auto opacity-50" />
						<p className="text-xs font-bold text-[var(--color-text-primary)]">
							Belum ada komentar
						</p>
						<p className="text-[11px] text-[var(--color-text-tertiary)]">
							Jadilah editor pertama yang memberikan ulasan atau pertanyaan!
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
