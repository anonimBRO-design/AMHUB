"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthLayout, Button, Input } from "@presethub/ui";
import { cn } from "@presethub/ui/lib/utils";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const supabase = useMemo(() => createSupabaseBrowserClient(), []);

	const handleResetRequest = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;

		const { error: resetError } = await supabase.auth.resetPasswordForEmail(
			email.trim(),
			{ redirectTo },
		);

		setIsLoading(false);

		if (resetError) {
			setError(resetError.message);
		} else {
			setIsSubmitted(true);
		}
	};

	return (
		<AuthLayout>
			<div className="space-y-4">
				<Link
					href="/auth/login"
					className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back to Sign in</span>
				</Link>

				<h1
					className={cn(
						"text-xl font-bold text-[var(--color-text-primary)]",
					)}
				>
					Reset Password
				</h1>

				{isSubmitted ? (
					<div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
						<div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
							<CheckCircle2 className="w-5 h-5" />
							<span>Check your email</span>
						</div>
						<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
							We sent a password reset link to <strong className="text-[var(--color-text-primary)]">{email}</strong>. Click the link in the email to set a new password.
						</p>
						<div className="pt-2">
							<Link
								href="/auth/login"
								className="block text-center py-2.5 px-4 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
							>
								Return to Login
							</Link>
						</div>
					</div>
				) : (
					<>
						<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
							Enter your registered email address and we'll send you a link to reset your AMHUB password.
						</p>

						<form onSubmit={handleResetRequest} className="space-y-4 pt-2">
							<Input
								label="Email address"
								type="email"
								value={email}
								onChange={setEmail}
								placeholder="name@example.com"
								isRequired
							/>

							<Button
								type="submit"
								isLoading={isLoading}
								className="w-full font-bold"
							>
								Send Reset Link
							</Button>

							{error && (
								<p className="text-xs text-[var(--color-text-error)]">
									{error}
								</p>
							)}
						</form>
					</>
				)}
			</div>
		</AuthLayout>
	);
}
