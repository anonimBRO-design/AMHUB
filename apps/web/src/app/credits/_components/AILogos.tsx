import type React from "react";

export function ChatGPTLogo({
	className = "w-12 h-12",
}: { className?: string }) {
	return (
		<img
			src="/ai-logos/chatgpt.svg"
			alt="ChatGPT logo"
			className={className}
			aria-label="ChatGPT"
		/>
	);
}

export function ClaudeLogo({
	className = "w-12 h-12",
}: { className?: string }) {
	return (
		<img
			src="/ai-logos/claude.svg"
			alt="Claude logo"
			className={className}
			aria-label="Claude"
		/>
	);
}

export function GeminiLogo({
	className = "w-12 h-12",
}: { className?: string }) {
	return (
		<img
			src="/ai-logos/gemini.svg"
			alt="Gemini logo"
			className={className}
			aria-label="Gemini"
		/>
	);
}

export function CodexLogo({ className = "w-12 h-12" }: { className?: string }) {
	return (
		<img
			src="/ai-logos/codex.svg"
			alt="Codex logo"
			className={className}
			aria-label="Codex"
		/>
	);
}

export function OpenCodeLogo({
	className = "w-12 h-12",
}: { className?: string }) {
	return (
		<img
			src="/ai-logos/opencode.svg"
			alt="OpenCode logo"
			className={className}
			aria-label="OpenCode"
		/>
	);
}

export function NineRouterLogo({
	className = "w-12 h-12",
}: { className?: string }) {
	return (
		<img
			src="/ai-logos/9router.svg"
			alt="9Router logo"
			className={className}
			aria-label="9Router"
		/>
	);
}

export function AntigravityLogo({
	className = "w-12 h-12",
}: { className?: string }) {
	return (
		<img
			src="/ai-logos/antigravity.svg"
			alt="Google DeepMind Antigravity logo"
			className={className}
			aria-label="Antigravity"
		/>
	);
}
