import * as React from "react";
import { Button } from "../../atoms/button";
import { Textarea } from "../../atoms/textarea";
import {
	CommentItem,
	type CommentItemProps,
} from "../../molecules/comment-item/comment-item";

export interface CommentThreadProps {
	comments: CommentItemProps["comment"][];
	onPostComment: (body: string) => void;
}

export const CommentThread = ({
	comments,
	onPostComment,
}: CommentThreadProps) => {
	const [newComment, setNewComment] = React.useState("");
	return (
		<section className="space-y-6">
			<h2 className="text-xl font-bold">{comments.length} Comments</h2>
			<div className="flex gap-2">
				<Textarea
					value={newComment}
					onChange={setNewComment}
					placeholder="Write a comment..."
				/>
				<Button
					onClick={() => {
						onPostComment(newComment);
						setNewComment("");
					}}
				>
					Post
				</Button>
			</div>
			<div className="space-y-4">
				{comments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
						isOwner={false}
						isPresetOwner={false}
						onLike={() => {}}
						onReply={() => {}}
						onDelete={() => {}}
						onPin={() => {}}
					/>
				))}
			</div>
		</section>
	);
};
