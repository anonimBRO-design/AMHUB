"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface UsernameFieldProps {
	value: string;
	initialUsername: string;
	onChange: (value: string) => void;
	onValidityChange?: (isValid: boolean, isChecking: boolean) => void;
}

export function UsernameField({
	value,
	initialUsername,
	onChange,
	onValidityChange,
}: UsernameFieldProps) {
	const [isChecking, setIsChecking] = useState(false);
	const [availability, setAvailability] = useState<{
		status: "idle" | "valid" | "taken" | "invalid";
		message: string | null;
	}>({
		status: "valid",
		message: "Username available",
	});

	const onValidityChangeRef = useRef(onValidityChange);
	useEffect(() => {
		onValidityChangeRef.current = onValidityChange;
	});

	useEffect(() => {
		const controller = new AbortController();
		const normalized = value.trim().toLowerCase().replace(/^@+/, "");
		const normalizedInitial = (initialUsername ?? "")
			.trim()
			.toLowerCase()
			.replace(/^@+/, "");

		if (normalized && normalized === normalizedInitial) {
			setAvailability({ status: "valid", message: "Username available" });
			setIsChecking(false);
			onValidityChangeRef.current?.(true, false);
			return;
		}

		if (!normalized || normalized.length < 3 || normalized.length > 30) {
			setAvailability({
				status: "invalid",
				message: "Username must be 3-30 characters long.",
			});
			setIsChecking(false);
			onValidityChangeRef.current?.(false, false);
			return;
		}

		if (!/^[a-z0-9_-]+$/.test(normalized)) {
			setAvailability({
				status: "invalid",
				message:
					"Only lowercase letters, numbers, underscores, and hyphens allowed.",
			});
			setIsChecking(false);
			onValidityChangeRef.current?.(false, false);
			return;
		}

		setIsChecking(true);
		onValidityChangeRef.current?.(false, true);

		const timer = setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/users/check-username?username=${encodeURIComponent(normalized)}`,
					{ signal: controller.signal },
				);
				const json = await res.json();
				if (controller.signal.aborted) return;

				if (!res.ok) {
					setAvailability({
						status: "invalid",
						message: json.error?.message || "Failed to check username.",
					});
					onValidityChangeRef.current?.(false, false);
				} else if (json.data?.available) {
					setAvailability({ status: "valid", message: "Username available" });
					onValidityChangeRef.current?.(true, false);
				} else {
					setAvailability({
						status: "taken",
						message: json.data?.reason || "Username already taken.",
					});
					onValidityChangeRef.current?.(false, false);
				}
			} catch (err: unknown) {
				if (
					controller.signal.aborted ||
					(err instanceof Error && err.name === "AbortError")
				) {
					return;
				}
				setAvailability({
					status: "invalid",
					message: "Failed to check availability.",
				});
				onValidityChangeRef.current?.(false, false);
			} finally {
				if (!controller.signal.aborted) {
					setIsChecking(false);
				}
			}
		}, 300);

		return () => {
			controller.abort();
			clearTimeout(timer);
		};
	}, [value, initialUsername]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
		onChange(raw);
	};

	return (
		<div className="space-y-1.5">
			<label
				htmlFor="settings-username"
				className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
			>
				Username *
			</label>

			<div className="relative flex items-center">
				<span className="absolute left-4 text-sm font-bold text-[var(--color-interactive-primary)] pointer-events-none select-none">
					@
				</span>
				<input
					id="settings-username"
					type="text"
					value={value}
					onChange={handleChange}
					required
					minLength={3}
					maxLength={30}
					placeholder="username"
					autoCapitalize="none"
					autoCorrect="off"
					spellCheck="false"
					className="w-full min-h-[44px] pl-8 pr-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-primary)] font-medium focus:outline-none focus:border-[var(--color-interactive-primary)]"
				/>
			</div>

			<div className="flex items-center gap-1.5 text-xs font-semibold pt-0.5 px-1">
				{isChecking ? (
					<>
						<Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
						<span className="text-cyan-300">Checking availability...</span>
					</>
				) : availability.status === "valid" ? (
					<>
						<Check className="w-3.5 h-3.5 text-emerald-400" />
						<span className="text-emerald-400">{availability.message}</span>
					</>
				) : (
					<>
						<AlertCircle className="w-3.5 h-3.5 text-rose-400" />
						<span className="text-rose-400">{availability.message}</span>
					</>
				)}
			</div>
		</div>
	);
}
