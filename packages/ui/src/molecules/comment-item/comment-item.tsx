import type { UserMini } from "@presethub/types/database";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { Textarea } from "../../atoms/textarea";
import { cn } from "../../lib/utils";
import {
	DropdownMenu,
	type DropdownMenuActionItem,
	type DropdownMenuItem,
} from "../../overlays/dropdown-menu";

export interface CommentItemProps {
	comment: {
		id: string;
		body: string;
		author: UserMini;
		likeCount: number;
		isLiked: boolean;
		isPinned: boolean;
		createdAt: string;
		replies?: CommentItemProps["comment"][];
	};
	isOwner: boolean;
	isPresetOwner: boolean;
	onLike: (id: string) => void;
	onReply: (id: string, body: string) => void;
	onDelete: (id: string) => void;
	onPin: (id: string) => void;
	depth?: 0 | 1;
}

export const CommentItem = ({
	comment,
	isOwner,
	isPresetOwner,
	onLike,
	onReply,
	onDelete,
	onPin,
	depth = 0,
}: CommentItemProps) => {
	const [isReplying, setIsReplying] = React.useState(false);
	const [replyBody, setReplyBody] = React.useState("");
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

	const dropdownItems = React.useMemo(() => {
		const items: DropdownMenuItem[] = [];
		if (isOwner) {
			items.push({
				type: "item",
				label: "Edit",
				onClick: () => {},
			} as DropdownMenuActionItem);
			items.push({
				type: "item",
				label: "Delete",
				variant: "danger",
				onClick: () => onDelete(comment.id),
			} as DropdownMenuActionItem);
		}
		if (isPresetOwner) {
			items.push({
				type: "item",
				label: comment.isPinned ? "Unpin" : "Pin",
				onClick: () => onPin(comment.id),
			} as DropdownMenuActionItem);
		}
		if (!isOwner) {
			items.push({
				type: "item",
				label: "Report",
				onClick: () => {},
			} as DropdownMenuActionItem);
		}
		return items;
	}, [comment.id, comment.isPinned, isOwner, isPresetOwner, onDelete, onPin]);

	return (
		<div className="flex flex-col gap-[var(--space-2)]">
			<article
				className={cn(
					"flex gap-[var(--space-2)]",
					depth === 1 && "pl-[var(--space-10)]",
				)}
			>
				<Avatar
					src={comment.author.avatar_url}
					alt={comment.author.username}
					displayName={comment.author.username}
					size={depth === 0 ? "sm" : "xs"}
				/>

				<div className="flex-1">
					<header className="flex items-center gap-[var(--space-1)]">
						<span className="heading-sm text-[var(--color-text-primary)]">
							{comment.author.username}
						</span>
						<span className="body-xs text-[var(--color-text-tertiary)]">
							· {comment.createdAt}
						</span>
					</header>

					<p className="body-md text-[var(--color-text-primary)] mt-[var(--space-0_5)]">
						{comment.body}
					</p>

					<footer className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onLike(comment.id)}
							className={cn(
								comment.isLiked && "text-[var(--color-text-error)]",
							)}
						>
							❤ {comment.likeCount}
						</Button>
						{depth === 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsReplying(!isReplying)}
							>
								↩ Reply
							</Button>
						)}
						<DropdownMenu
							isOpen={isDropdownOpen}
							onOpenChange={setIsDropdownOpen}
							items={dropdownItems}
							trigger={
								<Button variant="ghost" size="sm">
									<MoreHorizontal size={16} />
								</Button>
							}
						/>
					</footer>
				</div>
			</article>

			{isReplying && (
				<div className={cn("pl-[var(--space-10)]")}>
					<Textarea
						value={replyBody}
						onChange={(val) => setReplyBody(val)}
						placeholder="Write a reply..."
					/>
					<div className="flex justify-end gap-[var(--space-2)] mt-[var(--space-2)]">
						<Button variant="ghost" onClick={() => setIsReplying(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								onReply(comment.id, replyBody);
								setReplyBody("");
								setIsReplying(false);
							}}
						>
							Post Reply
						</Button>
					</div>
				</div>
			)}

			{comment.replies?.map((reply) => (
				<CommentItem
					key={reply.id}
					comment={reply}
					isOwner={false}
					isPresetOwner={isPresetOwner}
					onLike={onLike}
					onReply={onReply}
					onDelete={onDelete}
					onPin={onPin}
					depth={1}
				/>
			))}
		</div>
	);
};
