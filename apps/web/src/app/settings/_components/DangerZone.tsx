"use client";

import { LogOut, Trash2 } from "lucide-react";

export function DangerZone() {
	const handleSignOut = async () => {
		try {
			await fetch("/auth/logout", { method: "POST" });
			window.location.href = "/auth/login";
		} catch (e) {
			console.error("Sign out failed", e);
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
					className="w-full flex items-center justify-between p-4 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
				>
					<div className="flex items-center gap-3">
						<LogOut className="w-4 h-4" />
						<span>Sign Out of Account</span>
					</div>
				</button>

				{/* Delete Account Button */}
				<button
					type="button"
					onClick={() => alert("Contact support to delete your account.")}
					className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[var(--color-text-tertiary)] hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
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
