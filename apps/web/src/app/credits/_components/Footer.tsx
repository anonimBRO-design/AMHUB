import { Heart } from "lucide-react";

export function Footer() {
	return (
		<div className="pt-8 border-t border-[var(--color-border-subtle)] text-center space-y-3 text-xs text-[var(--color-text-tertiary)]">
			<div className="flex items-center justify-center gap-1.5 font-bold text-[var(--color-text-primary)]">
				<span>Built with</span>
				<Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
				<span>by AnonimBRO</span>
			</div>

			<p className="max-w-md mx-auto leading-relaxed">
				AI-assisted development powered by{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					ChatGPT
				</span>
				,{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					Claude
				</span>
				,{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					Gemini
				</span>
				,{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					Codex
				</span>
				,{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					OpenCode
				</span>
				,{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					9Router
				</span>
				, and{" "}
				<span className="font-semibold text-[var(--color-text-secondary)]">
					Antigravity
				</span>
				.
			</p>

			<p className="text-[10px] text-[var(--color-text-tertiary)] pt-2">
				© {new Date().getFullYear()} AMHUB. All rights reserved.
			</p>
		</div>
	);
}
