import type React from "react";
import { cn } from "../lib/utils";

interface AppLayoutTemplateProps {
	sidebar?: React.ReactNode;
	topBar: React.ReactNode;
	bottomNav?: React.ReactNode;
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
		<div className="flex min-h-screen max-w-full bg-[var(--color-bg-base)]">
			{/* Sidebar - Desktop (If provided) */}
			{sidebar ? (
				<div className="hidden lg:block fixed inset-y-0 left-0 w-[220px]">
					{sidebar}
				</div>
			) : null}

			<div
				className={cn(
					"flex-1 flex flex-col min-w-0 max-w-full",
					sidebar ? "lg:pl-[220px]" : "lg:pl-0",
				)}
			>
				{/* Top Bar - Sticky */}
				<div className="sticky top-0 z-[var(--z-sticky)] min-w-0 max-w-full">
					{topBar}
				</div>

				{/* Main Content */}
				<main className="flex-1 p-4 sm:p-6 pb-24 min-w-0 max-w-full">
					{children}
				</main>

				{/* Bottom Nav (If provided) */}
				{bottomNav ? (
					<div className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-overlay)]">
						{bottomNav}
					</div>
				) : null}
			</div>
		</div>
	);
};
