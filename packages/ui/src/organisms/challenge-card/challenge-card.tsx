import * as React from "react";
import { Button } from "../../atoms/button";

export interface ChallengeCardProps {
	challenge: {
		id: string;
		title: string;
		theme: string;
		description: string;
		expiresAt: string;
	};
	onSubmit: () => void;
	onBrowse: () => void;
}

export const ChallengeCard = ({
	challenge,
	onSubmit,
	onBrowse,
}: ChallengeCardProps) => {
	return (
		<article className="border rounded-xl p-6 shadow-glow-lg">
			<h2 className="text-xl font-bold">{challenge.title}</h2>
			<p>{challenge.theme}</p>
			<div className="mt-4 flex gap-2">
				<Button onClick={onSubmit}>Submit Entry</Button>
				<Button variant="secondary" onClick={onBrowse}>
					Browse Entries
				</Button>
			</div>
		</article>
	);
};
