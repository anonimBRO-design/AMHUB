"use client";

import { AuthLayout, Button, Input } from "@presethub/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@presethub/ui/lib/utils";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createSupabaseBrowserClient();

	const handleRegister = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { username },
			},
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		} else {
			// GAP NOTE: Writes to the users table beyond Supabase Auth itself are deferred.
			router.push("/");
			router.refresh();
		}
	};

	return (
		<AuthLayout>
			<h1 className={cn("text-xl font-bold mb-[var(--space-6)] text-[var(--color-text-primary)]")}>
				Create your account
			</h1>
			<form onSubmit={handleRegister} className={cn("space-y-[var(--space-4)]")}>
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
				<Button type="submit" isLoading={isLoading} className={cn("w-full")}>
					Register
				</Button>
				{error && (
					<p className={cn("text-[var(--color-text-error)] text-sm")}>
						{error}
					</p>
				)}
			</form>
			<p className={cn("mt-[var(--space-4)] text-sm text-[var(--color-text-secondary)]")}>
				Already have an account?{" "}
				<a
					href="/auth/login"
					className={cn("text-[var(--color-text-accent)] hover:underline")}
				>
					Sign in
				</a>
			</p>
		</AuthLayout>
	);
}
