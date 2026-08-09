import type React from "react";

export function ChatGPTLogo({ className = "w-4 h-4" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7712-4.2068 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7469-7.072zM13.2599 22.484a4.4759 4.4759 0 0 1-2.876-1.0406l.1419-.0819 4.779-2.7582a.7938.7938 0 0 0 .3948-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4977 4.496zm-9.364-3.565a4.4759 4.4759 0 0 1-.5355-3.0037l.142.085 4.7828 2.7582a.789.789 0 0 0 .7868 0l5.8344-3.3687v2.3326a.078.078 0 0 1-.0332.0616L10.0399 20.67a4.5045 4.5045 0 0 1-6.144-1.751zm-1.741-9.4312a4.4759 4.4759 0 0 1 2.3406-1.9632L4.3574 7.607l4.779 2.7581a.7938.7938 0 0 0 .7868 0l5.8344-3.3687-2.02-1.1683a.071.071 0 0 1-.038-.052L13.7 2.0163a4.5045 4.5045 0 0 1 1.6464 6.1441l-.142-.085-4.7828-2.7582a.789.789 0 0 0-.7868 0L3.7997 8.6859v-2.3326a.078.078 0 0 1 .0332-.0616l4.8323-2.783a4.5045 4.5045 0 0 1 6.144 1.751zm18.39 3.565a4.4759 4.4759 0 0 1 .5355 3.0037l-.142-.085-4.7828-2.7582a.789.789 0 0 0-.7868 0l-5.8344 3.3687v-2.3326a.078.078 0 0 1 .0332-.0616l4.8323-2.7831a4.5045 4.5045 0 0 1 6.144 1.751z" />
		</svg>
	);
}

export function ClaudeLogo({ className = "w-4 h-4" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M13.8 2.5L12 9.2L10.2 2.5H7.5L9.8 11.2L3.5 8v2.7l6.3 3.3L3.5 17.3v2.7l6.3-3.2L7.5 25.5h2.7l1.8-6.7 1.8 6.7h2.7l-2.3-8.7 6.3 3.2v-2.7l-6.3-3.3 6.3-3.3V8l-6.3 3.2L16.5 2.5h-2.7z" />
		</svg>
	);
}

export function GeminiLogo({ className = "w-4 h-4" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
		</svg>
	);
}

export function CodexLogo({ className = "w-4 h-4" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M8.5 6L3 12l5.5 6 1.4-1.4L5.8 12l4.1-4.6L8.5 6zm7 0l-1.4 1.4 4.1 4.6-4.1 4.6 1.4 1.4 5.5-6-5.5-6zM13.5 4h-3L8 20h3l2.5-16z" />
		</svg>
	);
}

export function OpenCodeLogo({
	className = "w-4 h-4",
}: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M4 17l6-6-6-6" />
			<path d="M12 19h8" />
			<path d="M13 3l-2 5h4l-2 5" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function NineRouterLogo({
	className = "w-4 h-4",
}: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<rect x="2" y="2" width="8" height="8" rx="2" />
			<rect x="14" y="2" width="8" height="8" rx="2" />
			<rect x="8" y="14" width="8" height="8" rx="2" />
			<path d="M6 10v4h2" />
			<path d="M18 10v4h-2" />
		</svg>
	);
}

export function AntigravityLogo({
	className = "w-4 h-4",
}: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
			<polyline points="12,22 12,12 22,6.5" />
			<line x1="12" y1="12" x2="2" y2="6.5" />
		</svg>
	);
}
