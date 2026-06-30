"use client";

import { NavigationSidebar } from "@presethub/ui";
import { MobileBottomNav } from "@presethub/ui";
import { TopBar } from "@presethub/ui";
import "../styles/globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Placeholder user/state for shell
	const currentUser = {
		username: "johndoe",
		displayName: "John Doe",
		level: 1,
		levelName: "Beginner",
	};

	return (
		<html lang="en">
			<body className="bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]">
				<div className="flex min-h-screen">
					<NavigationSidebar
						currentUser={currentUser}
						activeRoute="/"
						recentActivity={[]}
						trendingTags={[]}
					/>
					<div className="flex-1 flex flex-col lg:pl-[220px]">
						<TopBar
							unreadNotificationCount={0}
							isScrolled={false}
							onSearchSubmit={() => {}}
						/>
						<main className="flex-1 p-6 pb-20 lg:pb-6">{children}</main>
						<MobileBottomNav
							activeRoute="/"
							currentUser={{ displayName: "John Doe" }}
						/>
					</div>
				</div>
			</body>
		</html>
	);
}
