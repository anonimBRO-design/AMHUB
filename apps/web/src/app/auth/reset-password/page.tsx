"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthLayout, Button, Input } from "@presethub/ui";
import { cn } from "@presethub/ui/lib/utils";
import { CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const supabase = useMemo(() => createSupabaseBrowserClient(), []);

	const handleUpdatePassword = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setIsLoading(true);

		const { error: updateError } = await supabase.auth.updateUser({
			password,
		});

		setIsLoading(false);

		if (updateError) {
			setError(updateError.message);
		} else {
			setIsSuccess(true);
			setTimeout(() => {
				router.push("/home");
				router.refresh();
			}, 2500);
		}
	};

	return (
		<AuthLayout>
			<div className="space-y-4">
				<h1
					className={cn("text-xl font-bold text-[var(--color-text-primary)]")}
				>
					Set New Password
				</h1>

				{isSuccess ? (
					<div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
						<div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
							<CheckCircle2 className="w-5 h-5" />
							<span>Password updated successfully!</span>
						</div>
						<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
							Your password has been changed. Redirecting you to AMHUB...
						</p>
					</div>
				) : (
					<>
						<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
							Create a strong, new password for your AMHUB account.
						</p>

						<form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
							<Input
								label="New Password"
								type="password"
								value={password}
								onChange={setPassword}
								placeholder="At least 6 characters"
								isRequired
							/>

							<Input
								label="Confirm New Password"
								type="password"
								value={confirmPassword}
								onChange={setConfirmPassword}
								placeholder="Re-enter new password"
								isRequired
							/>

							<Button
								type="submit"
								isLoading={isLoading}
								className="w-full font-bold"
							>
								Update Password
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
