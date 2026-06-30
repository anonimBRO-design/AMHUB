import * as React from "react";
import { Avatar } from "../../atoms/avatar";

export interface LeaderboardEntry {
	rank: number;
	scoreLabel: string;
	creator: {
		username: string;
		displayName: string;
		avatarUrl?: string;
	};
}

export const LeaderboardPanel = ({
	entries,
}: { entries: LeaderboardEntry[] }) => {
	return (
		<section className="border rounded-lg p-4">
			<h2 className="font-bold mb-4">Leaderboard</h2>
			<ol className="space-y-2">
				{entries.map((entry) => (
					<li key={entry.rank} className="flex items-center gap-2">
						<span className="font-bold">#{entry.rank}</span>
						<Avatar
							src={entry.creator.avatarUrl}
							alt={entry.creator.displayName}
							displayName={entry.creator.displayName}
							size="sm"
						/>
						<span>{entry.creator.displayName}</span>
						<span className="ml-auto">{entry.scoreLabel}</span>
					</li>
				))}
			</ol>
		</section>
	);
};
