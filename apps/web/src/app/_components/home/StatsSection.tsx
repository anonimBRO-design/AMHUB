import { Download, FileCode, QrCode, ShieldCheck } from "lucide-react";

export function StatsSection() {
	const features = [
		{
			icon: FileCode,
			title: "XML Presets",
			description:
				"Full element layers & keyframes ready to import directly into Alight Motion.",
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		},
		{
			icon: QrCode,
			title: "QR Code Scan",
			description:
				"Scan QR codes instantly using your mobile camera or Alight Motion app.",
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
		},
		{
			icon: Download,
			title: "1-Tap Links",
			description:
				"Direct alight.link project imports with zero redirection or popups.",
			color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
		},
		{
			icon: ShieldCheck,
			title: "Verified Quality",
			description:
				"Every preset is checked and verified by editor community moderators.",
			color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
		},
	];

	return (
		<section className="p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-6">
			<div className="text-center max-w-lg mx-auto space-y-2">
				<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
					Built for Alight Motion Editors
				</h2>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
					Streamlined mobile workflow designed for fast creation, effortless
					sharing, and highest playback quality.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{features.map((feat) => {
					const Icon = feat.icon;
					return (
						<div
							key={feat.title}
							className="p-5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-3 transition-all duration-200 hover:border-[var(--color-interactive-primary)]/30 hover:shadow-lg"
						>
							<div className={`p-3 rounded-2xl w-fit border ${feat.color}`}>
								<Icon className="w-5 h-5" />
							</div>
							<h3 className="text-base font-bold text-[var(--color-text-primary)]">
								{feat.title}
							</h3>
							<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
								{feat.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
