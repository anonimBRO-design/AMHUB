import type React from "react";
import { cn } from "../lib/utils";

interface AppLayoutTemplateProps {
	sidebar: React.ReactNode;
	topBar: React.ReactNode;
	bottomNav: React.ReactNode;
	children: React.ReactNode;
}

/**
 * Standard Application Layout Template
 * Design System §17.T.1
 */
export const AppLayoutTemplate: React.FC<AppLayoutTemplateProps> = ({
	sidebar,
	topBar,
	bottomNav,
	children,
}) => {
	return (
		<div className="flex min-h-screen bg-[var(--color-bg-base)]">
			{/* Sidebar - Desktop */}
			<div className="hidden lg:block fixed inset-y-0 left-0 w-[220px]">
				{sidebar}
			</div>

			<div className="flex-1 flex flex-col lg:pl-[220px]">
				{/* Top Bar - Sticky */}
				<div className="sticky top-0 z-[var(--z-sticky)]">
					{topBar}
				</div>

				{/* Main Content */}
				<main className="flex-1 p-6 pb-20 lg:pb-6">
					{children}
				</main>

				{/* Bottom Nav - Mobile */}
				<div className="lg:hidden fixed bottom-0 left-0 right-0 z-[var(--z-overlay)]">
					{bottomNav}
				</div>
			</div>
		</div>
	);
};
