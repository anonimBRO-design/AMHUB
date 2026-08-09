"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams.toString();
	const hasInitializedPostHog = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined" || hasInitializedPostHog.current) return;

		const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
		const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

		if (!key || !host) return;

		posthog.init(key, {
			api_host: host,
			capture_pageview: false,
			capture_pageleave: true,
			autocapture: true,
		});

		hasInitializedPostHog.current = true;
	}, []);

	useEffect(() => {
		if (!hasInitializedPostHog.current) return;

		posthog.capture("$pageview");
	}, [pathname, searchParamsString]);

	return children;
}
