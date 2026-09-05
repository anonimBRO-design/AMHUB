"use client";

import {
	AFFILIATE_REF_COOKIE,
	AFFILIATE_REF_MAX_AGE_SECONDS,
	isValidReferralCode,
	normalizeReferralCode,
} from "@/lib/affiliate";
import { useEffect } from "react";

/**
 * Captures `?ref=<username>` landing links into a 30-day cookie
 * so referred preset purchases can credit the referrer.
 * Rendered once in the global layout shell; renders nothing.
 */
export function ReferralTracker() {
	useEffect(() => {
		try {
			const params = new URLSearchParams(window.location.search);
			const rawRef = params.get("ref");
			if (!isValidReferralCode(rawRef)) return;
			const username = normalizeReferralCode(rawRef as string);
			const secure = window.location.protocol === "https:" ? "; Secure" : "";
			document.cookie =
				`${AFFILIATE_REF_COOKIE}=${encodeURIComponent(username)}` +
				`; Max-Age=${AFFILIATE_REF_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
		} catch {
			// referral capture is best-effort
		}
	}, []);

	return null;
}
