import { Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="w-full pt-10 pb-24 sm:pb-12 border-t border-white/[0.08] backdrop-blur-xl bg-white/[0.02] text-[var(--color-text-secondary)]">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
				<div className="flex flex-col md:flex-row items-start justify-between gap-8">
					{/* Brand Info */}
					<div className="space-y-3 max-w-sm">
						<Link
							href="/"
							className="flex items-center gap-2.5 text-lg font-extrabold text-[var(--color-text-primary)] hover:opacity-90 transition-opacity font-display"
						>
							<img
								src="/logo.png"
								alt="AMHUB Logo"
								className="h-8 w-8 object-contain rounded-lg"
							/>
							<span>AMHUB</span>
						</Link>
						<p className="font-body text-xs text-[var(--color-text-tertiary)] leading-relaxed">
							The premier community platform for Alight Motion creators.
							Discover, share, and import pro XML, QR, and link presets.
						</p>
					</div>

					{/* Navigation Links Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs w-full md:w-auto font-body">
						<div className="space-y-3">
							<h4 className="font-display font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
								Explore
							</h4>
							<ul className="space-y-2">
								<li>
									<Link
										href="/explore?category=velocity"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Velocity Edits
									</Link>
								</li>
								<li>
									<Link
										href="/explore?category=transition"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Transitions
									</Link>
								</li>
								<li>
									<Link
										href="/explore?category=color"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Color Grading
									</Link>
								</li>
								<li>
									<Link
										href="/explore?category=anime"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Anime Edits
									</Link>
								</li>
							</ul>
						</div>

						<div className="space-y-3">
							<h4 className="font-display font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
								Creator Hub
							</h4>
							<ul className="space-y-2">
								<li>
									<Link
										href="/upload"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Upload Preset
									</Link>
								</li>
								<li>
									<Link
										href="/dashboard"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Creator Dashboard
									</Link>
								</li>
								<li>
									<Link
										href="/bookmarks"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Saved Bookmarks
									</Link>
								</li>
								<li>
									<Link
										href="/credits"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Credits & About
									</Link>
								</li>
							</ul>
						</div>

						<div className="space-y-3">
							<h4 className="font-display font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
								Account
							</h4>
							<ul className="space-y-2">
								<li>
									<Link
										href="/auth/login"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Log In
									</Link>
								</li>
								<li>
									<Link
										href="/auth/register"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Sign Up
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-tertiary)] font-body">
					<p>© {new Date().getFullYear()} AMHUB. All rights reserved.</p>
					<div className="flex items-center gap-1">
						<span>Crafted with</span>
						<Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
						<span>for Alight Motion Creators</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
