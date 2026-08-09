"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
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

		if (!posthog.__loaded) {
			posthog.init(projectToken, {
				api_host: host,
				capture_pageview: false,
				capture_pageleave: true,
				defaults: "2026-01-30",
				capture_exceptions: true,
				debug: process.env.NODE_ENV === "development",
			});
		}
		posthog.captureException(error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<main>
					<h1>Something went wrong</h1>
					<p>An unexpected error occurred while loading the application.</p>
					<button type="button" onClick={reset}>
						Try again
					</button>
				</main>
			</body>
		</html>
	);
}
