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

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const supabase = useMemo(() => createSupabaseBrowserClient(), []);
	const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));

	const handleRegister = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!agreedToTerms) {
			setError("You must agree to the Terms of Service to create an account.");
			return;
		}

		setIsLoading(true);

		const callbackUrl = new URL("/auth/callback", window.location.origin);
		callbackUrl.searchParams.set("next", redirectTo);
		const trimmedUsername = username.trim();

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					display_name: trimmedUsername,
					username: trimmedUsername,
				},
				emailRedirectTo: callbackUrl.toString(),
			},
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		} else if (data.session) {
			router.replace(redirectTo);
			router.refresh();
		} else {
			router.replace(
				`/auth/login?status=check_email&redirectTo=${encodeURIComponent(
					redirectTo,
				)}`,
			);
		}
	};

	return (
		<AuthLayout>
			<h1
				className={cn(
					"text-xl font-bold mb-[var(--space-6)] text-[var(--color-text-primary)]",
				)}
			>
				Create your account
			</h1>
			<form
				onSubmit={handleRegister}
				className={cn("space-y-[var(--space-4)]")}
			>
				<Input
					label="Username"
					type="text"
					value={username}
					onChange={setUsername}
					isRequired
				/>
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

				{/* Checkbox Agreement */}
				<div className="flex items-start gap-2.5 pt-1 text-left">
					<input
						id="terms-agreement"
						type="checkbox"
						checked={agreedToTerms}
						onChange={(e) => {
							setAgreedToTerms(e.target.checked);
							if (error && error.includes("Terms")) {
								setError(null);
							}
						}}
						className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[var(--color-bg-elevated)] text-[var(--color-interactive-primary)] focus:ring-[var(--color-interactive-primary)] cursor-pointer accent-[var(--color-interactive-primary)] shrink-0"
					/>
					<label
						htmlFor="terms-agreement"
						className="text-xs text-[var(--color-text-secondary)] leading-relaxed select-none cursor-pointer"
					>
						I agree to the{" "}
						<a
							href="/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--color-interactive-primary)] hover:underline font-semibold"
						>
							Terms of Service
						</a>
					</label>
				</div>

				<Button type="submit" isLoading={isLoading} className={cn("w-full")}>
					Register
				</Button>
				{error && (
					<p className={cn("text-[var(--color-text-error)] text-sm")}>
						{error}
					</p>
				)}
			</form>
			<p
				className={cn(
					"mt-[var(--space-4)] text-sm text-[var(--color-text-secondary)]",
				)}
			>
				Already have an account?{" "}
				<a
					href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
					className={cn("text-[var(--color-text-accent)] hover:underline")}
				>
					Sign in
				</a>
			</p>
		</AuthLayout>
	);
}
