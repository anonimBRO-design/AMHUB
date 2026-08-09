"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type IdentifiedUser = {
	id: string;
	email: string;
	username: string;
	display_name: string;
};

export function PostHogProvider({
	children,
	currentUser,
}: {
	children: ReactNode;
	currentUser: IdentifiedUser | null;
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams.toString();
	const hasInitializedPostHog = useRef(false);
	const [isPostHogInitialized, setIsPostHogInitialized] = useState(false);
	const identifiedUserId = useRef<string | null>(null);

	useEffect(() => {
		if (typeof window === "undefined" || hasInitializedPostHog.current) return;

		const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
		const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

		if (!projectToken || !host) {
			if (process.env.NODE_ENV === "development") {
				const missingVariable = !projectToken
					? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
					: "NEXT_PUBLIC_POSTHOG_HOST";
				throw new Error(
					`${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
				);
			}
			return;
		}

		posthog.init(projectToken, {
			api_host: host,
			capture_pageview: false,
			capture_pageleave: true,
			defaults: "2026-01-30",
			capture_exceptions: true,
			debug: process.env.NODE_ENV === "development",
		});

		hasInitializedPostHog.current = true;
		setIsPostHogInitialized(true);
	}, []);

	useEffect(() => {
		if (!isPostHogInitialized || !currentUser) return;
		if (identifiedUserId.current === currentUser.id) return;

		if (identifiedUserId.current) {
			posthog.reset();
		}

		posthog.identify(currentUser.id, {
			email: currentUser.email,
			username: currentUser.username,
			display_name: currentUser.display_name,
		});
		identifiedUserId.current = currentUser.id;
	}, [currentUser, isPostHogInitialized]);

	useEffect(() => {
		if (!isPostHogInitialized) return;

		const url = pathname + (searchParamsString ? `?${searchParamsString}` : "");
		posthog.capture("$pageview", { $current_url: url });
	}, [isPostHogInitialized, pathname, searchParamsString]);

	return children;
}
