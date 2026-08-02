import type { ReactNode } from "react";

interface SettingsGroupProps {
	title: string;
	description?: string;
	children: ReactNode;
}

export function SettingsGroup({
	title,
	description,
	children,
}: SettingsGroupProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-0.5 px-1">
				<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					{title}
				</h3>
				{description && (
					<p className="text-xs text-[var(--color-text-tertiary)]">
						{description}
					</p>
				)}
			</div>
			<div className="divide-y divide-[var(--color-border-subtle)]/60 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden shadow-lg">
				{children}
			</div>
		</div>
	);
}
