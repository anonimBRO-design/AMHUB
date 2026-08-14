"use client";

import type { PresetSourceFormat, ValidationResult } from "@/lib/validation/types";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";

interface ValidationCardProps {
	selectedFileTypes: PresetSourceFormat[];
	validation: ValidationResult;
}

export function ValidationCard({ selectedFileTypes, validation }: ValidationCardProps) {
	const { isValid, isValidating, checks, error } = validation;

	const formatTitle = selectedFileTypes
		.map((t) => (t === "xml" ? "XML File" : t === "gdrive" ? "Google Drive (XML)" : "AM Link"))
		.join(" + ") || "Preset Sources";

	// If no checks have run yet
	if (checks.every((c) => c.status === "idle") && !isValidating && !error) {
		return null;
	}

	return (
		<div className="p-5 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10 space-y-4 shadow-xl transition-all duration-300">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
				<div className="flex items-center gap-2">
					<ShieldCheck className="w-4 h-4 text-purple-400" />
					<h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
						{formatTitle} Validation Checklist
					</h4>
				</div>
				{isValidating && (
					<div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
						<Loader2 className="w-3.5 h-3.5 animate-spin" />
						<span>Validating...</span>
					</div>
				)}
			</div>

			{/* Checklist */}
			<div className="space-y-2.5">
				{checks.map((check) => {
					return (
						<div
							key={check.id}
							className="flex items-start justify-between gap-3 text-xs"
						>
							<div className="flex items-center gap-2">
								{check.status === "success" && (
									<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
								)}
								{check.status === "error" && (
									<XCircle className="w-4 h-4 text-rose-400 shrink-0" />
								)}
								{check.status === "loading" && (
									<Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
								)}
								{check.status === "idle" && (
									<div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
								)}
								<span
									className={`font-medium ${
										check.status === "success"
											? "text-white"
											: check.status === "error"
												? "text-rose-300 font-semibold"
												: "text-[var(--color-text-secondary)]"
									}`}
								>
									{check.label}
								</span>
							</div>

							{check.message && (
								<span className="text-[11px] font-mono text-[var(--color-text-tertiary)] truncate max-w-[200px]">
									{check.message}
								</span>
							)}
						</div>
					);
				})}
			</div>

			{/* Status Banner */}
			<div className="pt-2 border-t border-white/[0.08]">
				{isValid ? (
					<div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
							<span>🟢 All Selected Sources Valid</span>
						</div>
						<span className="text-[11px] font-normal text-emerald-400">
							Ready to continue
						</span>
					</div>
				) : error ? (
					<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
						<div className="flex items-center gap-2 font-bold text-rose-400">
							<span>🔴 Validation Required</span>
						</div>
						<p className="text-[11px] font-normal text-rose-300/90 leading-relaxed">
							{error}
						</p>
					</div>
				) : null}
			</div>
		</div>
	);
}
