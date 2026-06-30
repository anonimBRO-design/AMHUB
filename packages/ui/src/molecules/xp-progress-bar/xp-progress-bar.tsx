import * as React from "react";
import { cn } from "../../lib/utils";

export interface XPProgressBarProps {
	currentXP: number;
	nextLevelXP: number;
	currentLevel: number;
	currentLevelName: string;
	nextLevelName: string;
	showNumbers?: boolean;
	animate?: boolean;
}

export const XPProgressBar = ({
	currentXP,
	nextLevelXP,
	currentLevel,
	currentLevelName,
	nextLevelName,
	showNumbers = true,
	animate = true,
}: XPProgressBarProps) => {
	const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

	return (
		<div className="w-full flex flex-col gap-[var(--space-1)]">
			<div className="flex justify-between items-center">
				<span className="heading-sm text-[var(--color-text-primary)]">
					Level {currentLevel} — {currentLevelName}
				</span>
				{showNumbers && (
					<span className="mono-sm text-[var(--color-text-secondary)]">
						{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
					</span>
				)}
			</div>
			<div className="h-[var(--space-1)] w-full rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] overflow-hidden">
				<div
					className={cn(
						"h-full rounded-[var(--radius-full)] bg-gradient-to-r from-[var(--color-interactive-primary)] to-[var(--color-accent-400)] transition-all duration-[var(--dur-slow)] ease-[var(--ease-out)]",
						animate ? "origin-left" : "",
					)}
					style={{
						width: animate ? `${progress}%` : `${progress}%`,
						transform: animate ? `scaleX(${progress / 100})` : "none",
					}}
				/>
			</div>
			<span className="label-sm text-[var(--color-text-secondary)]">
				Next: Level {currentLevel + 1} — {nextLevelName}
			</span>
		</div>
	);
};
