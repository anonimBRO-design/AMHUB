"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const LogoutButton = ({ className }: { className?: string }) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			const supabase = createSupabaseBrowserClient();
			await supabase.auth.signOut();

			// Hard refresh to clear all client-side state
			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Logout failed:", error);
			alert("Logout failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={isLoading}
			className={`flex items-center gap-2 ${className}`}
		>
			<LogOut className="w-4 h-4" />
			<span>{isLoading ? "Logging out..." : "Sign Out"}</span>
		</button>
	);
};
