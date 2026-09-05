"use client";

import { buildReferralLink } from "@/lib/affiliate";
import { Check, Copy, Link2, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface AffiliateStats {
	totalReferrals: number;
	totalCommission: number;
}

export function AffiliateCard({ username }: { username: string }) {
	const [stats, setStats] = useState<AffiliateStats | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		fetch("/api/affiliate/stats")
			.then((res) => (res.ok ? res.json() : null))
			.then((json) => {
				if (json?.data) setStats(json.data as AffiliateStats);
			})
			.catch(() => {});
	}, []);

	const referralLink =
		typeof window !== "undefined"
			? buildReferralLink(window.location.origin, username)
			: "";

	const handleCopy = async () => {
		if (!referralLink) return;
		try {
			await navigator.clipboard.writeText(referralLink);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	};

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
					<Users className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						Link Afiliasi Saya
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						Bagikan link — dapatkan 5% dari tiap pembelian preset lewat linkmu
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
				<Link2 className="w-4 h-4 text-[var(--color-text-tertiary)] ml-2 shrink-0" />
				<code className="flex-1 text-xs text-[var(--color-text-secondary)] truncate font-mono">
					{referralLink || "Memuat..."}
				</code>
				<button
					type="button"
					onClick={handleCopy}
					className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-md bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] active:scale-95 transition-all shrink-0"
				>
					{copied ? (
						<>
							<Check className="w-3.5 h-3.5 text-emerald-400" />
							<span className="text-emerald-400">Tersalin!</span>
						</>
					) : (
						<>
							<Copy className="w-3.5 h-3.5" />
							<span>Salin</span>
						</>
					)}
				</button>
			</div>

			<div className="grid grid-cols-2 gap-2.5">
				<div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60">
					<Users className="w-4 h-4 text-cyan-400 shrink-0" />
					<div>
						<span className="block text-base font-extrabold text-[var(--color-text-primary)] tabular-nums">
							{stats ? stats.totalReferrals.toLocaleString("id-ID") : "—"}
						</span>
						<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Pembelian
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60">
					<Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
					<div>
						<span className="block text-base font-extrabold text-[var(--color-text-primary)] tabular-nums">
							{stats
								? `Rp ${Math.round(stats.totalCommission).toLocaleString("id-ID")}`
								: "—"}
						</span>
						<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Komisi
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
