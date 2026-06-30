"use client";

import { NotificationItem, SearchBar } from "@presethub/ui";

export default function NotificationsPage() {
	return (
		<div className="space-y-4">
			<SearchBar value="" onChange={() => {}} onSubmit={() => {}} />
			<NotificationItem
				notification={{
					id: "1",
					type: "like",
					message: "User liked your preset",
					isRead: false,
					createdAt: "2h ago",
				}}
				onClick={() => {}}
			/>
		</div>
	);
}
