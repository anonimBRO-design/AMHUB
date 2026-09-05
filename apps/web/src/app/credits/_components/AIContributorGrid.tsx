import {
	AntigravityLogo,
	ChatGPTLogo,
	ClaudeLogo,
	CodexLogo,
	GeminiLogo,
	NineRouterLogo,
	OpenCodeLogo,
} from "./AILogos";

export function AIContributorGrid() {
	const aiContributors = [
		{
			name: "ChatGPT",
			provider: "OpenAI",
			role: "Architecture, debugging, UX planning, and engineering guidance.",
			icon: ChatGPTLogo,
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
		},
		{
			name: "Claude",
			provider: "Anthropic",
			role: "Large-scale implementation, refactoring, and complex reasoning.",
			icon: ClaudeLogo,
			color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
		},
		{
			name: "Gemini",
			provider: "Google",
			role: "Frontend implementation, UI generation, and system verification.",
			icon: GeminiLogo,
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		},
		{
			name: "Codex",
			provider: "OpenAI",
			role: "Code generation and monorepo codebase assistance.",
			icon: CodexLogo,
			color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
		},
		{
			name: "OpenCode",
			provider: "Autonomous Workflow",
			role: "Repository automation and autonomous coding workflows.",
			icon: OpenCodeLogo,
			color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
		},
		{
			name: "9Router",
			provider: "Router Infrastructure",
			role: "Multi-model routing and provider management.",
			icon: NineRouterLogo,
			color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
		},
		{
			name: "Antigravity",
			provider: "Google DeepMind",
			role: "AI gateway, tool orchestration, and agentic pair-programming.",
			icon: AntigravityLogo,
			color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
		},
	];

	return (
		<div className="space-y-4">
			<div className="space-y-1 px-1">
				<h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">
					AI Contributors & Orchestration
				</h2>
				<p className="text-xs text-[var(--color-text-secondary)]">
					Powered by state-of-the-art artificial intelligence models & agent
					frameworks.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{aiContributors.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.name}
							className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-2 shadow-md hover:border-[var(--color-interactive-primary)]/40 transition-all"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<div className={`p-2 rounded-2xl border ${item.color}`}>
										<Icon className="w-4 h-4" />
									</div>
									<div>
										<h3 className="text-sm font-bold text-[var(--color-text-primary)]">
											{item.name}
										</h3>
										<span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
											{item.provider}
										</span>
									</div>
								</div>
							</div>
							<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-1">
								{item.role}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}
