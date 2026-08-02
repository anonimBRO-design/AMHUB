import { Compass, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4 max-w-md mx-auto my-8">
			<div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-interactive-primary)] shadow-xl">
				<Compass className="w-10 h-10 animate-spin-slow" />
			</div>

			<div className="space-y-1">
				<span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-interactive-primary)] px-2.5 py-1 rounded-full bg-[var(--color-interactive-primary)]/10 border border-[var(--color-interactive-primary)]/20">
					404 ERROR
				</span>
				<h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)] pt-1">
					Page Not Found
				</h1>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					The page or Alight Motion preset you are looking for doesn't exist or
					has been moved.
				</p>
			</div>

			<div className="flex items-center gap-3 pt-2">
				<Link
					href="/"
					className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-lg hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
				>
					<Home className="w-4 h-4" />
					<span>Back to Home</span>
				</Link>

				<Link
					href="/explore"
					className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] font-bold text-xs hover:border-[var(--color-border-strong)] active:scale-95 transition-all"
				>
					<Compass className="w-4 h-4" />
					<span>Explore Catalog</span>
				</Link>
			</div>
		</div>
	);
}
