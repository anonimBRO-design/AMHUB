"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthLayout, Button, Input } from "@presethub/ui";
import { cn } from "@presethub/ui/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

const getSafeRedirectPath = (value: string | null) => {
	if (!value || !value.startsWith("/") || value.startsWith("//")) {
		return "/";
	}

	return value;
};

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const supabase = useMemo(() => createSupabaseBrowserClient(), []);
	const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));
	const statusMessage =
		searchParams.get("status") === "check_email"
			? "Check your email to confirm your account, then sign in."
			: null;
	const callbackError = searchParams.get("error")
		? "We could not complete that sign-in. Please try again."
		: null;

	const handleLogin = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		} else {
			router.replace(redirectTo);
			router.refresh();
		}
	};

	const handleOAuthLogin = async (provider: "google") => {
		setIsLoading(true);
		setError(null);

		const callbackUrl = new URL("/auth/callback", window.location.origin);
		callbackUrl.searchParams.set("next", redirectTo);

		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: callbackUrl.toString(),
			},
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout>
			<h1
				className={cn(
					"text-xl font-bold mb-[var(--space-6)] text-[var(--color-text-primary)]",
				)}
			>
				Sign in to AMHUB
			</h1>
			{(statusMessage || callbackError) && (
				<p
					className={cn(
						"mb-[var(--space-4)] text-sm",
						callbackError
							? "text-[var(--color-text-error)]"
							: "text-[var(--color-text-secondary)]",
					)}
				>
					{callbackError ?? statusMessage}
				</p>
			)}
			<form onSubmit={handleLogin} className={cn("space-y-[var(--space-4)]")}>
				<Input
					label="Email"
					type="email"
					value={email}
					onChange={setEmail}
					isRequired
				/>
				<Input
					label="Password"
					type="password"
					value={password}
					onChange={setPassword}
					isRequired
				/>
				<div className="flex justify-end -mt-2">
					<a
						href="/auth/forgot-password"
						className="text-xs text-[var(--color-text-accent)] hover:underline"
					>
						Forgot password?
					</a>
				</div>
				<Button type="submit" isLoading={isLoading} className={cn("w-full")}>
					Sign in
				</Button>
				{error && (
					<p className={cn("text-[var(--color-text-error)] text-sm")}>
						{error}
					</p>
				)}
			</form>
			<div className={cn("mt-[var(--space-4)]")}>
				<Button
					type="button"
					variant="secondary"
					onClick={() => handleOAuthLogin("google")}
					isDisabled={isLoading}
					className={cn("w-full")}
				>
					Google
				</Button>
			</div>
			<p
				className={cn(
					"mt-[var(--space-4)] text-sm text-[var(--color-text-secondary)]",
				)}
			>
				Don't have an account?{" "}
				<a
					href={`/auth/register?redirectTo=${encodeURIComponent(redirectTo)}`}
					className={cn("text-[var(--color-text-accent)] hover:underline")}
				>
					Register
				</a>
			</p>
		</AuthLayout>
	);
}
