import { Download, FileCode, QrCode, ShieldCheck } from "lucide-react";

export function StatsSection() {
	const features = [
		{
			icon: FileCode,
			title: "XML Presets",
			description:
				"Full element layers & keyframes ready to import directly into Alight Motion.",
			color: "text-blue-400 border-blue-500/20",
		},
		{
			icon: QrCode,
			title: "QR Code Scan",
			description:
				"Scan QR codes instantly using your mobile camera or Alight Motion app.",
			color: "text-emerald-400 border-emerald-500/20",
		},
		{
			icon: Download,
			title: "1-Tap Links",
			description:
				"Direct alight.link project imports with zero redirection or popups.",
			color: "text-indigo-400 border-indigo-500/20",
		},
		{
			icon: ShieldCheck,
			title: "Verified Quality",
			description:
				"Every preset is checked and verified by editor community moderators.",
			color: "text-purple-400 border-purple-500/20",
		},
	];

	return (
		<section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-6 shadow-md transition-all duration-300">
			<div className="relative z-10 text-center max-w-lg mx-auto space-y-2">
				<h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
					Built for Alight Motion Editors
				</h2>
				<p className="font-body text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					Streamlined mobile workflow designed for fast creation, effortless
					sharing, and highest playback quality.
				</p>
			</div>

			<div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{features.map((feat) => {
					const Icon = feat.icon;
					return (
						<div
							key={feat.title}
							className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3 transition-all duration-300 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-default)] hover:-translate-y-0.5 hover:shadow-sm"
						>
							<div className={`p-3 rounded-2xl w-fit border ${feat.color}`}>
								<Icon className="w-5 h-5" />
							</div>
							<h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
								{feat.title}
							</h3>
							<p className="font-body text-xs text-[var(--color-text-secondary)] leading-relaxed">
								{feat.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
