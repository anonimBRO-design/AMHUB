import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { cn } from "../../lib/utils";
import { BadgeChip } from "../../molecules/badge-chip/badge-chip";

export interface ProfileHeaderProps {
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		badges: Array<{
			key: string;
			name: string;
			description?: string;
			iconUrl?: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		}>;
	};
	isOwnProfile: boolean;
	onFollow: () => void;
	onShare: () => void;
}

export const ProfileHeader = ({
	user,
	isOwnProfile,
	onFollow,
	onShare,
}: ProfileHeaderProps) => {
	return (
		<header className="relative">
			<div className="h-48 w-full bg-gradient-to-r from-gray-300 to-gray-100" />
			<div className="px-6 pb-6">
				<div className="relative -mt-12 mb-4 flex items-end gap-4">
					<Avatar
						src={user.avatarUrl}
						alt={user.displayName}
						displayName={user.displayName}
						size="3xl"
					/>
					<div className="flex-1 pb-4">
						<h1 className="text-2xl font-bold">{user.displayName}</h1>
						<p className="text-gray-600">@{user.username}</p>
					</div>
					<div className="flex gap-2 pb-4">
						{isOwnProfile ? (
							<Button variant="secondary">Edit Profile</Button>
						) : (
							<Button onClick={onFollow}>Follow</Button>
						)}
						<Button variant="ghost" onClick={onShare}>
							Share
						</Button>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{user.badges.map((badge) => (
						<BadgeChip key={badge.key} badge={badge} />
					))}
				</div>
			</div>
		</header>
	);
};
