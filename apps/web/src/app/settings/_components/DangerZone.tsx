"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

export function DangerZone() {
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleSignOut = async () => {
		setIsLoggingOut(true);
		try {
			const supabase = createSupabaseBrowserClient();
			await supabase.auth.signOut();
			await fetch("/auth/logout", { method: "POST" }).catch(() => {});
			posthog.reset();
		} catch (e) {
			console.error("Sign out failed", e);
		} finally {
			if (typeof window !== "undefined") {
				window.localStorage.clear();
				window.sessionStorage.clear();
				window.location.href = "/auth/login";
			}
		}
	};

	return (
		<div className="space-y-3">
			<h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 px-1">
				Account Management
			</h3>

			<div className="rounded-3xl bg-[var(--color-bg-surface)] border border-rose-500/20 overflow-hidden shadow-lg divide-y divide-rose-500/10">
				{/* Sign Out Button */}
				<button
					type="button"
					onClick={handleSignOut}
					disabled={isLoggingOut}
					className="w-full flex items-center justify-between p-4 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
				>
					<div className="flex items-center gap-3">
						{isLoggingOut ? (
							<Loader2 className="w-4 h-4 animate-spin text-rose-400" />
						) : (
							<LogOut className="w-4 h-4" />
						)}
						<span>{isLoggingOut ? "Signing Out..." : "Sign Out of Account"}</span>
					</div>
				</button>

				{/* Delete Account Button */}
				<button
					type="button"
					onClick={() => alert("To delete your account and all associated presets/data, please contact support at support@amhub.com")}
					className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[var(--color-text-tertiary)] hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
				>
					<div className="flex items-center gap-3">
						<Trash2 className="w-4 h-4" />
						<span>Delete Account & Data</span>
					</div>
				</button>
			</div>
		</div>
	);
}
