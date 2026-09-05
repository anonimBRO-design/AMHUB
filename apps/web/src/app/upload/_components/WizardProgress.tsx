import { Check } from "lucide-react";

interface WizardProgressProps {
	currentStep: number;
	totalSteps: number;
	steps: Array<{ num: number; label: string }>;
}

export function WizardProgress({
	currentStep,
	totalSteps,
	steps,
}: WizardProgressProps) {
	const progressPercent = Math.round((currentStep / totalSteps) * 100);

	return (
		<div className="space-y-3">
			{/* Top Bar */}
			<div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] px-1">
				<span>
					Step {currentStep} of {totalSteps}
				</span>
				<span className="text-[var(--color-interactive-primary)]">
					{progressPercent}% Completed
				</span>
			</div>

			{/* Progress Bar Line */}
			<div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
				<div
					className="h-full bg-gradient-to-r from-[var(--color-interactive-primary)] to-cyan-400 transition-all duration-300 ease-out"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* Steps Chips Bar */}
			<div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1 text-xs font-semibold select-none">
				{steps.map((s) => {
					const isDone = currentStep > s.num;
					const isCurrent = currentStep === s.num;

					return (
						<div
							key={s.num}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
								isCurrent
									? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
									: isDone
										? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
										: "bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)]"
							}`}
						>
							{isDone ? (
								<Check className="w-3.5 h-3.5 text-emerald-400" />
							) : (
								<span className="text-[11px] font-mono">{s.num}</span>
							)}
							<span className="text-xs whitespace-nowrap">{s.label}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
