"use client";

import { MessageSquare, Send, User } from "lucide-react";
import { type FormEvent, useState } from "react";

interface Comment {
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
	initialComments?: Comment[];
	commentCount?: number;
}

export function CommentSection({
	presetId,
	initialComments = [],
	commentCount = 0,
}: CommentSectionProps) {
	const [comments, setComments] = useState<Comment[]>(initialComments);
	const [newComment, setNewComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!newComment.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			const res = await fetch(`/api/presets/${presetId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: newComment.trim() }),
			});

			if (res.ok) {
				const json = await res.json();
				if (json.data) {
					setComments((prev) => [json.data, ...prev]);
				} else {
					// Fallback optimistic comment if server response is minimal
					setComments((prev) => [
						{
							id: Date.now().toString(),
							content: newComment.trim(),
							createdAt: new Date().toISOString(),
							user: {
								username: "you",
								displayName: "You",
								avatarUrl: null,
							},
						},
						...prev,
					]);
				}
				setNewComment("");
			}
		} catch (error) {
			console.error("Failed to post comment", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-5 shadow-lg">
			<div className="flex items-center gap-2">
				<div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
					<MessageSquare className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						Community Discussion
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						{comments.length || commentCount} Comments
					</p>
				</div>
			</div>

			{/* Add Comment Input */}
			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder="Leave a comment or ask a question..."
					aria-label="Add a comment"
					className="flex-1 min-h-[44px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
				/>
				<button
					type="submit"
					disabled={isSubmitting || !newComment.trim()}
					className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs disabled:opacity-50 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all shrink-0"
				>
					<Send className="w-4 h-4" />
				</button>
			</form>

			{/* Comments List */}
			<div className="space-y-3 pt-2">
				{comments.length > 0 ? (
					comments.map((comment) => (
						<div
							key={comment.id}
							className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/60 space-y-1.5"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<img
										src={
											comment.user.avatarUrl ||
											`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.user.username}`
										}
										alt={comment.user.displayName}
										className="w-5 h-5 rounded-full object-cover"
									/>
									<span className="text-xs font-bold text-[var(--color-text-primary)]">
										{comment.user.displayName}
									</span>
								</div>
								<span className="text-[10px] text-[var(--color-text-tertiary)]">
									{new Date(comment.createdAt).toLocaleDateString()}
								</span>
							</div>
							<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-7">
								{comment.content}
							</p>
						</div>
					))
				) : (
					<p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">
						No comments yet. Be the first to share your thoughts!
					</p>
				)}
			</div>
		</section>
	);
}
