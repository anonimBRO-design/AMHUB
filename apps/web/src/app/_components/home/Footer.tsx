"use client";

import { useLanguage } from "@/i18n";
import { ExternalLink, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
	const { t } = useLanguage();

	return (
		<footer className="w-full pt-10 pb-24 sm:pb-12 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]">
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
								width={32}
								height={32}
								className="h-8 w-8 object-contain rounded-lg shrink-0"
								style={{ width: 32, height: 32, maxWidth: 32, maxHeight: 32 }}
							/>

							<span>AMHUB</span>
						</Link>
						<p className="font-body text-xs text-[var(--color-text-tertiary)] leading-relaxed">
							The premier community platform for Alight Motion creators.
							Discover, share, and import pro XML, Google Drive, and link presets.
						</p>
						<a
							href="https://sociabuzz.com/anonimbro"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-accent)] border border-[var(--color-border-accent)] text-xs font-bold text-[var(--color-text-accent)] hover:text-white transition-all shadow-sm"
						>
							<Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
							<span>{t.common.supportAmhub}</span>
							<ExternalLink className="w-3 h-3 opacity-70" />
						</a>
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
										href="/explore?category=jj-tipis"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										JJ Tipis
									</Link>
								</li>
								<li>
									<Link
										href="/explore?category=jj-melar"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										JJ Kenyat-Kenyot
									</Link>
								</li>
								<li>
									<Link
										href="/explore?category=jj-belah"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										JJ Belah
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
								<li>
									<button
										type="button"
										onClick={() => {
											if (typeof window !== "undefined") {
												window.dispatchEvent(new CustomEvent("pwa:open-install"));
											}
										}}
										className="hover:text-[var(--color-interactive-primary)] text-purple-400 font-medium transition-colors text-left inline-flex items-center gap-1"
									>
										<span>📲 Install App (PWA)</span>
									</button>
								</li>
							</ul>
						</div>

						<div className="space-y-3">
							<h4 className="font-display font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
								Account & Legal
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
								<li>
									<Link
										href="/terms"
										className="hover:text-[var(--color-interactive-primary)] transition-colors"
									>
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-tertiary)] font-body">
					<div className="flex items-center gap-4 flex-wrap">
						<p>© {new Date().getFullYear()} AMHUB. All rights reserved.</p>
						<Link
							href="/terms"
							className="hover:text-[var(--color-interactive-primary)] transition-colors underline-offset-4 hover:underline"
						>
							Terms of Service
						</Link>
					</div>
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
