"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import {
	CheckCircle2,
	ChevronRight,
	FileCode2,
	LogIn,
	QrCode,
	Sparkles,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface WelcomeClientProps {
	user?: User | null;
}

export function WelcomeClient({ user: initialUser }: WelcomeClientProps) {
	const [isSplash, setIsSplash] = useState(true);
	const [authUser, setAuthUser] = useState<User | null>(initialUser ?? null);
	const [isOAuthLoading, setIsOAuthLoading] = useState(false);
	const router = useRouter();
	const supabase = useMemo(() => createSupabaseBrowserClient(), []);

	// Check client-side auth state
	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data?.user) {
				setAuthUser(data.user);
			}
		});
	}, [supabase]);

	// Splash duration & Auth redirection control
	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (authUser) {
			// Authenticated user: Splash for max 800ms then redirect to /home
			timer = setTimeout(() => {
				router.replace("/home");
			}, 800);
		} else {
			// Unauthenticated user: Splash for 1800ms (1.5s–2.0s) then reveal Welcome Screen
			timer = setTimeout(() => {
				setIsSplash(false);
			}, 1800);
		}

		return () => clearTimeout(timer);
	}, [authUser, router]);

	const handleGoogleLogin = async () => {
		setIsOAuthLoading(true);
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
		<AnimatePresence mode="wait">
			{isSplash ? (
				/* 1. Splash Screen View (Always shown on first launch) */
				<motion.div
					key="splash"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, scale: 0.96 }}
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-white select-none overflow-hidden"
				>
					{/* Particle Glow Backdrop */}
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
						<div className="w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-600/25 via-indigo-500/15 to-purple-600/25 blur-[100px] animate-pulse" />
						<div className="absolute w-72 h-72 rounded-full bg-purple-500/20 blur-[80px] animate-ambient-float" />
					</div>

					<div className="relative z-10 flex flex-col items-center gap-6">
						{/* Logo Glow Ring */}
						<div className="relative group">
							<div className="absolute -inset-6 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 opacity-70 blur-2xl animate-pulse" />
							<div className="relative p-4 rounded-3xl bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl shadow-2xl">
								<img
									src="/logo.png"
									alt="AMHUB Logo"
									width={80}
									height={80}
									className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-2xl shrink-0"
									style={{ width: "100%", height: "100%", maxWidth: 96, maxHeight: 96 }}
								/>
							</div>
						</div>

						<div className="text-center space-y-1.5">
							<h1 className="font-['Syne',sans-serif] font-display text-2xl sm:text-3xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
								AMHUB
							</h1>
							<p className="text-xs text-[var(--color-text-tertiary)] font-semibold tracking-widest uppercase">
								Alight Motion Presets
							</p>
						</div>

						{/* Loading bar */}
						<div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden mt-3 p-0.5 backdrop-blur-sm border border-white/5">
							<div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 rounded-full w-full animate-loading-bar shadow-[0_0_12px_rgba(124,58,237,0.8)]" />
						</div>
					</div>
				</motion.div>
			) : (
				/* 2. Welcome Landing Screen (Revealed for Unauthenticated Users) */
				<motion.div
					key="welcome"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
					className="relative min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col justify-between overflow-x-hidden select-none"
				>
					{/* Ambient Floating Orbs */}
					<div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] pointer-events-none animate-ambient-float" />
					<div className="fixed bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-gradient-to-tl from-indigo-600/15 via-purple-900/20 to-transparent rounded-full blur-[130px] pointer-events-none animate-glow-pulse" />
					<div className="fixed top-[40%] left-[-15%] w-[350px] h-[350px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

					{/* Main Content Container */}
					<div className="relative z-10 flex-1 max-w-md w-full mx-auto px-5 pt-8 pb-10 flex flex-col justify-between space-y-8">
						{/* Top Branding */}
						<div className="flex flex-col items-center text-center space-y-4 pt-4">
							<div className="relative group">
								<div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-40 blur-xl group-hover:opacity-75 transition-opacity duration-500" />
								<div className="relative p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-xl">
									<img
										src="/logo.png"
										alt="AMHUB Logo"
										width={64}
										height={64}
										className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl shrink-0"
										style={{ width: "100%", height: "100%", maxWidth: 80, maxHeight: 80 }}
									/>
								</div>
							</div>


							<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.15)]">
								<Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
								<span>VERSION 1.0 NOW LIVE</span>
							</div>
						</div>

						{/* Hero Headline & Subtitle */}
						<div className="text-center space-y-3">
							<h1 className="font-['Syne',sans-serif] font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
								Discover Premium <br />
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200">
									Alight Motion Presets
								</span>
							</h1>
							<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
								Join 50,000+ editors. Access production-ready XML presets, 3D
								camera shakes, velocity ramps & custom LUTs.
							</p>
						</div>

						{/* Feature Cards Grid */}
						<div className="grid grid-cols-2 gap-3">
							<div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-2 group cursor-default">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.2)]">
									<FileCode2 className="w-4.5 h-4.5" />
								</div>
								<h3 className="font-['Syne',sans-serif] font-display text-xs font-bold text-white">
									XML Presets
								</h3>
								<p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
									Full element layers & keyframes
								</p>
							</div>

							<div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-2 group cursor-default">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.2)]">
									<QrCode className="w-4.5 h-4.5" />
								</div>
								<h3 className="font-['Syne',sans-serif] font-display text-xs font-bold text-white">
									QR Import
								</h3>
								<p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
									Scan & import directly into AM
								</p>
							</div>

							<div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-2 group cursor-default">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
									<Users className="w-4.5 h-4.5" />
								</div>
								<h3 className="font-['Syne',sans-serif] font-display text-xs font-bold text-white">
									Top Creators
								</h3>
								<p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
									30+ popular AMV & velocity editors
								</p>
							</div>

							<div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-2 group cursor-default">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
									<CheckCircle2 className="w-4.5 h-4.5" />
								</div>
								<h3 className="font-['Syne',sans-serif] font-display text-xs font-bold text-white">
									60FPS Quality
								</h3>
								<p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
									Verified smooth project playback
								</p>
							</div>
						</div>

						{/* Authentication CTA Stack */}
						<div className="space-y-3 pt-2">
							{/* 1. Primary Google CTA */}
							<button
								type="button"
								onClick={handleGoogleLogin}
								disabled={isOAuthLoading}
								className="w-full min-h-[52px] h-13 sm:h-14 rounded-2xl bg-white text-gray-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 hover:bg-white/95 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.28)] active:scale-[0.97] disabled:opacity-50 cursor-pointer"
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

							{/* 2. Secondary Login CTA */}
							<Link
								href="/auth/login"
								className="w-full min-h-[52px] h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-[var(--color-interactive-primary)] via-purple-600 to-indigo-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-95 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:shadow-[0_0_32px_rgba(124,58,237,0.5)] active:scale-[0.97]"
							>
								<LogIn className="w-4.5 h-4.5" />
								<span>Log In</span>
							</Link>

							{/* 3. Outline Create Account CTA */}
							<Link
								href="/auth/register"
								className="w-full min-h-[52px] h-13 sm:h-14 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]"
							>
								<UserPlus className="w-4.5 h-4.5" />
								<span>Create Account</span>
							</Link>

							{/* 4. Text Button: Continue as Guest */}
							<Link
								href="/home"
								className="w-full py-3.5 text-center text-xs sm:text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-white transition-colors duration-300 flex items-center justify-center gap-1.5 group min-h-[52px]"
							>
								<span>Continue as Guest</span>
								<ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-[var(--color-text-tertiary)] group-hover:text-purple-400" />
							</Link>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
