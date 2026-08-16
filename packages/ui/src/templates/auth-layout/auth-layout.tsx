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
		<div
			className={cn(
				"flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-base)] p-[var(--space-6)]",
			)}
		>
			<header className={cn("mb-[var(--space-8)]")}>
				<a
					href="/"
					aria-label="AMHUB — Return to home"
					className={cn(
						"flex items-center gap-3 hover:opacity-90 transition-opacity",
					)}
				>
					<img
						src="/logo.png"
						alt="AMHUB Logo"
						width={40}
						height={40}
						className="h-10 w-10 object-contain rounded-xl shadow-md shrink-0"
						style={{ width: 40, height: 40, maxWidth: 40, maxHeight: 40 }}
					/>

					<span className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						AMHUB
					</span>
				</a>
			</header>

			<main
				id="main-content"
				tabIndex={-1}
				className={cn(
					"w-full rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-2xl",
					"max-w-sm",
				)}
			>
				{children}
			</main>
		</div>
	);
};
