import type React from "react";
import { cn } from "../../lib/utils";

export interface AuthLayoutProps {
	children: React.ReactNode;
}

/**
 * Authentication Layout Template
 * Design System §17.T.Auth
 */
export const AuthLayout = ({ children }: AuthLayoutProps) => {
	return (
		<div className={cn("flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-base)] p-[var(--space-6)]")}>
			<header className={cn("mb-[var(--space-8)]")}>
				<a 
					href="/" 
					aria-label="PresetHub — Return to home" 
					className={cn("text-2xl font-bold text-[var(--color-text-primary)]")}
				>
					PresetHub
				</a>
			</header>

			<main
				id="main-content"
				tabIndex={-1}
				className={cn(
					"w-full rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[var(--space-8)] shadow-[var(--shadow-card)]",
					"max-w-sm" // Kept as standard utility due to lack of direct token equivalent
				)}
			>
				{children}
			</main>
		</div>
	);
};
