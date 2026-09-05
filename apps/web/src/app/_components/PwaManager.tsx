"use client";

import { Download, Share, Smartphone, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaManager() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isStandalone, setIsStandalone] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [showBanner, setShowBanner] = useState(false);
	const [showIOSModal, setShowIOSModal] = useState(false);

	useEffect(() => {
		// 1. Register Service Worker
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) => {
					console.log(
						"[PWA] Service Worker registered successfully:",
						reg.scope,
					);
				})
				.catch((err) => {
					console.warn("[PWA] Service Worker registration failed:", err);
				});
		}

		// 2. Check if already running in standalone/installed mode
		const checkStandalone = () => {
			const isStandaloneMode =
				window.matchMedia("(display-mode: standalone)").matches ||
				(window.navigator as unknown as { standalone?: boolean }).standalone ===
					true;
			setIsStandalone(Boolean(isStandaloneMode));
		};
		checkStandalone();

		// 3. Detect iOS Safari
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
		setIsIOS(isIosDevice);

		// 4. Capture beforeinstallprompt for Android/Chrome
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);

			// Check dismissal timestamp (suppress for 3 days if dismissed)
			const dismissedAt = localStorage.getItem("amhub_pwa_dismissed_at");
			if (dismissedAt) {
				const diffDays =
					(Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
				if (diffDays < 3) return;
			}

			// Show floating banner after 3 seconds for smooth UX
			const timer = setTimeout(() => {
				setShowBanner(true);
			}, 3000);
			return () => clearTimeout(timer);
		};

		window.addEventListener(
			"beforeinstallprompt",
			handleBeforeInstallPrompt as EventListener,
		);

		// 5. Global listener for manual trigger (e.g. from footer / menu)
		const handleManualTrigger = () => {
			if (deferredPrompt) {
				deferredPrompt.prompt();
				deferredPrompt.userChoice.then((choiceResult) => {
					if (choiceResult.outcome === "accepted") {
						setShowBanner(false);
					}
					setDeferredPrompt(null);
				});
			} else if (isIosDevice) {
				setShowIOSModal(true);
			} else {
				setShowBanner(true);
			}
		};

		window.addEventListener("pwa:open-install", handleManualTrigger);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt as EventListener,
			);
			window.removeEventListener("pwa:open-install", handleManualTrigger);
		};
	}, [deferredPrompt]);

	const handleInstallClick = async () => {
		if (deferredPrompt) {
			await deferredPrompt.prompt();
			const choice = await deferredPrompt.userChoice;
			if (choice.outcome === "accepted") {
				setShowBanner(false);
			}
			setDeferredPrompt(null);
		} else if (isIOS) {
			setShowIOSModal(true);
		} else {
			// Fallback: alert instructions for desktop Chrome / Edge
			alert(
				"Klik ikon instal (+) pada bilah alamat browser kamu untuk memasang AMHUB!",
			);
		}
	};

	const handleDismiss = () => {
		setShowBanner(false);
		localStorage.setItem("amhub_pwa_dismissed_at", Date.now().toString());
	};

	// Don't render banner if already installed as PWA
	if (isStandalone) return null;

	return (
		<>
			{/* Floating Premium Install Banner */}
			{showBanner && (
				<div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
					<div className="relative overflow-hidden rounded-2xl bg-[#13111C]/95 border border-cyan-500/30 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
						{/* Background Glow Effect */}
						<div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-600/30 rounded-full blur-2xl pointer-events-none" />
						<div className="absolute -left-8 -bottom-8 w-24 h-24 bg-pink-600/20 rounded-full blur-2xl pointer-events-none" />

						<div className="flex items-start gap-3.5 relative z-10">
							{/* App Icon */}
							<div className="relative w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/40 shadow-md shrink-0 bg-black">
								<Image
									src="/icon-192.png"
									alt="AMHUB Logo"
									fill
									className="object-cover"
								/>
							</div>

							{/* Text Content */}
							<div className="flex-1 min-w-0 pr-6">
								<div className="flex items-center gap-1.5">
									<h4 className="text-sm font-extrabold text-white tracking-tight">
										Install AMHUB App
									</h4>
									<span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-cyan-500 to-pink-500 text-white uppercase tracking-wider">
										GRATIS
									</span>
								</div>
								<p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
									Akses preset JJ & XML lebih cepat langsung dari layar utama HP
									kamu tanpa browser!
								</p>

								{/* Action Buttons */}
								<div className="flex items-center gap-2 mt-3">
									<button
										type="button"
										onClick={handleInstallClick}
										className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 active:scale-95 transition-all"
									>
										<Download className="w-3.5 h-3.5" />
										<span>Install Sekarang</span>
									</button>
									<button
										type="button"
										onClick={handleDismiss}
										className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
									>
										Nanti Saja
									</button>
								</div>
							</div>

							{/* Close Button */}
							<button
								type="button"
								onClick={handleDismiss}
								aria-label="Tutup banner install"
								className="absolute right-0 top-0 p-1 text-gray-400 hover:text-white rounded-lg"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* iOS Safari Step-by-Step Install Guide Modal */}
			{showIOSModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="relative w-full max-w-sm rounded-3xl bg-[#13111C] border border-cyan-500/40 p-6 shadow-2xl space-y-4 text-center">
						<div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
							<Smartphone className="w-6 h-6" />
						</div>

						<div className="space-y-1">
							<h3 className="text-lg font-bold text-white">
								Install AMHUB di iPhone
							</h3>
							<p className="text-xs text-gray-400">
								Ikuti 3 langkah mudah berikut di Safari:
							</p>
						</div>

						<div className="space-y-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10 text-xs text-gray-200">
							<div className="flex items-center gap-3">
								<span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
									1
								</span>
								<p>
									Ketuk tombol <strong>Bagikan (Share)</strong>{" "}
									<Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> di
									bawah layar Safari.
								</p>
							</div>

							<div className="flex items-center gap-3">
								<span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
									2
								</span>
								<p>
									Gulir ke bawah dan pilih{" "}
									<strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to
									Home Screen).
								</p>
							</div>

							<div className="flex items-center gap-3">
								<span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
									3
								</span>
								<p>
									Ketuk <strong>&quot;Tambah&quot;</strong> di pojok kanan atas.
									Selesai! 🎉
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={() => setShowIOSModal(false)}
							className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 active:scale-95 transition-all"
						>
							Saya Mengerti
						</button>
					</div>
				</div>
			)}
		</>
	);
}
