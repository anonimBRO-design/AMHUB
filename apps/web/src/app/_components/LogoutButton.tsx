"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import posthog from "posthog-js";
import type React from "react";
import { useState } from "react";

export const LogoutButton = ({
	className,
	children,
}: {
	className?: string;
	children?: React.ReactNode;
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async (e?: React.MouseEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		setIsLoading(true);
		try {
			const supabase = createSupabaseBrowserClient();
			await supabase.auth.signOut();
			posthog.reset();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			if (typeof window !== "undefined") {
				window.localStorage.clear();
				window.sessionStorage.clear();
				window.location.href = "/";
			}
		}
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={isLoading}
			aria-label="Sign Out"
			className={
				className ??
				"flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
			}
		>
			{children ?? (
				<>
					<LogOut className="w-4 h-4" />
					<span>{isLoading ? "Logging out..." : "Sign Out"}</span>
				</>
			)}
		</button>
	);
};
