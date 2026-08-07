"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
	actionTitle?: string;
}

export function AuthModal({
	isOpen,
	onClose,
	actionTitle = "Sign in to unlock full access",
}: AuthModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const supabase = createSupabaseBrowserClient();

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		const callbackUrl = new URL("/auth/callback", window.location.origin);
		callbackUrl.searchParams.set("next", "/home");

		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: callbackUrl.toString(),
			},
		});
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
					{/* Glassmorphism Backdrop Overlay */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
						onClick={onClose}
						className="fixed inset-0 bg-black/80 backdrop-blur-xl"
					/>

					{/* Modal Glass Card */}
					<motion.div
						initial={{ opacity: 0, scale: 0.92, y: 16 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 8 }}
						transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
						className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-[#0f0e14]/90 border border-white/[0.1] shadow-2xl shadow-purple-950/40 space-y-6 text-center overflow-hidden z-10"
					>
						{/* Ambient Glow Orbs in Modal Background */}
						<div className="absolute -top-28 -left-28 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px] pointer-events-none animate-pulse" />
						<div className="absolute -bottom-28 -right-28 w-64 h-64 bg-indigo-600/25 rounded-full blur-[80px] pointer-events-none animate-ambient-float" />
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

						{/* Close Button */}
						<button
							type="button"
							onClick={onClose}
							className="absolute top-4 right-4 p-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[var(--color-text-tertiary)] hover:text-white hover:bg-white/[0.12] hover:border-white/[0.2] transition-all duration-300 active:scale-[0.97] cursor-pointer"
						>
							<X className="w-4 h-4" />
						</button>

						{/* Header */}
						<div className="space-y-3 pt-2">
							<div className="relative w-16 h-16 mx-auto group">
								<div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-300" />
								<div className="relative w-full h-full rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.12] p-2.5 flex items-center justify-center shadow-lg">
									<img
										src="/logo.png"
										alt="AMHUB Logo"
										className="w-10 h-10 object-contain drop-shadow-md"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<h3 className="font-['Syne',sans-serif] font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
									{actionTitle}
								</h3>
								<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
									Join the AMHUB creator community to like presets, bookmark
									favorites, follow top editors, and publish your own XML files.
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="space-y-3 pt-2">
							{/* Primary Google CTA */}
							<button
								type="button"
								onClick={handleGoogleLogin}
								disabled={isLoading}
								className="w-full min-h-[52px] h-13 sm:h-14 rounded-2xl bg-white text-gray-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 hover:bg-white/95 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.28)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
							>
								<svg
									className="w-5 h-5"
									viewBox="0 0 24 24"
									aria-label="Google Logo"
								>
									<title>Google Logo</title>
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
									/>
								</svg>
								<span>Continue with Google</span>
							</button>

							{/* Secondary Login CTA */}
							<Link
								href="/auth/login"
								onClick={onClose}
								className="w-full min-h-[52px] h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-[var(--color-interactive-primary)] via-purple-600 to-indigo-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-95 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:shadow-[0_0_32px_rgba(124,58,237,0.5)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-[0.97]"
							>
								<LogIn className="w-4.5 h-4.5" />
								<span>Log In with Email</span>
							</Link>

							{/* Outline Register CTA */}
							<Link
								href="/auth/register"
								onClick={onClose}
								className="w-full min-h-[52px] h-13 sm:h-14 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-[0.97]"
							>
								<UserPlus className="w-4.5 h-4.5" />
								<span>Create Account</span>
							</Link>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
