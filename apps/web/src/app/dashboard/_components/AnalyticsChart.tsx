"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { useState } from "react";

type Timeframe = "7d" | "30d" | "90d";

export function AnalyticsChart() {
	const [timeframe, setTimeframe] = useState<Timeframe>("7d");

	// Synthetic chart bar data
	const chartData = [
		{ label: "Mon", value: 45, height: "60%" },
		{ label: "Tue", value: 68, height: "85%" },
		{ label: "Wed", value: 52, height: "70%" },
		{ label: "Thu", value: 89, height: "100%" },
		{ label: "Fri", value: 74, height: "90%" },
		{ label: "Sat", value: 61, height: "78%" },
		{ label: "Sun", value: 82, height: "95%" },
	];

	return (
		<div className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			{/* Header & Filter Pills */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<BarChart3 className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							Performance Analytics
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Download & view activity over time
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs font-semibold select-none w-fit">
					{(["7d", "30d", "90d"] as Timeframe[]).map((tf) => (
						<button
							key={tf}
							type="button"
							onClick={() => setTimeframe(tf)}
							className={`px-3 py-1 rounded-xl transition-all ${
								timeframe === tf
									? "bg-[var(--color-interactive-primary)] text-white shadow-sm"
									: "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
							}`}
						>
							{tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
						</button>
					))}
				</div>
			</div>

			{/* Visual Bar Chart */}
			<div className="pt-6 pb-2">
				<div className="h-44 flex items-end justify-between gap-2 px-2">
					{chartData.map((item) => (
						<div
							key={item.label}
							className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
						>
							<div
								className="w-full max-w-[36px] rounded-xl bg-gradient-to-t from-[var(--color-interactive-primary)]/40 to-[var(--color-interactive-primary)] group-hover:opacity-90 transition-all duration-300 relative"
								style={{ height: item.height }}
							>
								{/* Tooltip on hover */}
								<div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none whitespace-nowrap">
									{item.value} dl
								</div>
							</div>
							<span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
								{item.label}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Chart Footer Summary */}
			<div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--color-border-subtle)]/60 text-[var(--color-text-secondary)]">
				<div className="flex items-center gap-1.5 text-emerald-400 font-bold">
					<TrendingUp className="w-4 h-4" />
					<span>+24.8% growth vs last period</span>
				</div>
				<span className="text-[var(--color-text-tertiary)]">
					Updated 1h ago
				</span>
			</div>
		</div>
	);
}
