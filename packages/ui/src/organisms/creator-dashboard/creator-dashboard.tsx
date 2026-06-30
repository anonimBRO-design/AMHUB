import { Download, Eye, Heart, Users } from "lucide-react";
import * as React from "react";
import { StatCard } from "../../molecules/stat-card/stat-card";

export interface CreatorDashboardProps {
	stats: {
		totalDownloads: number;
		totalViews: number;
		followerCount: number;
		totalLikes: number;
	};
}

export const CreatorDashboard = ({ stats }: CreatorDashboardProps) => {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			<div className="grid grid-cols-4 gap-4">
				<StatCard
					label="Downloads"
					value={stats.totalDownloads}
					icon={Download}
				/>
				<StatCard label="Views" value={stats.totalViews} icon={Eye} />
				<StatCard label="Followers" value={stats.followerCount} icon={Users} />
				<StatCard label="Likes" value={stats.totalLikes} icon={Heart} />
			</div>
			<div className="border rounded-lg p-6">
				<h2>Analytics Chart (Placeholder)</h2>
			</div>
		</div>
	);
};
