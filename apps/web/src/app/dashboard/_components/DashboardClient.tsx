"use client";

import { AnalyticsChart } from "./AnalyticsChart";
import { DashboardHero } from "./DashboardHero";
import { MyPresetsManager } from "./MyPresetsManager";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { StatsCards } from "./StatsCards";

interface PresetItem {
	id: string;
	title: string;
	slug: string;
	description?: string | null;
	thumbnail_url: string;
	file_type: "xml" | "qr" | "link";
	category: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	tags: string[];
	download_count: number;
	like_count: number;
	view_count: number;
	status: "pending" | "published" | "rejected" | "removed";
	created_at: string;
}

interface AnalyticsData {
	timeframe: "7d" | "30d" | "90d";
	hasData: boolean;
	topPresets: {
		id: string;
		title: string;
		slug: string;
		thumbnail_url: string;
		download_count: number;
		like_count: number;
		view_count: number;
		status: string;
		created_at: string;
	}[];
	likesOverTime: { date: string; count: number }[];
}

interface DashboardClientProps {
	user: {
		displayName: string;
		username: string;
		avatarUrl?: string | null;
	};
	stats: {
		totalDownloads: number;
		totalLikes: number;
		followerCount: number;
		followingCount: number;
		totalViews: number;
		presetCount: number;
	};
	initialPresets: PresetItem[];
	initialAnalytics?: AnalyticsData;
}

export function DashboardClient({
	user,
	stats,
	initialPresets,
	initialAnalytics,
}: DashboardClientProps) {
	return (
		<div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-4 sm:px-0">
			<DashboardHero user={user} />
			<QuickActions username={user.username} />
			<StatsCards stats={stats} />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<AnalyticsChart initialData={initialAnalytics} />
				</div>
				<div>
					<RecentActivity />
				</div>
			</div>

			<MyPresetsManager initialPresets={initialPresets} />
		</div>
	);
}
