"use client";

import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	ChevronRight,
	Clock,
	FileText,
	Globe,
	HelpCircle,
	Lock,
	Mail,
	Scale,
	ScrollText,
	Shield,
	ShieldAlert,
	Sparkles,
	Upload,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Section {
	id: string;
	number: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	summary: string;
	content: React.ReactNode;
}

export function TermsClient() {
	const router = useRouter();
	const [activeSection, setActiveSection] = useState<string>("intro");

	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	const sections: Section[] = [
		{
			id: "intro",
			number: "01",
			title: "Introduction",
			icon: Sparkles,
			summary: "Overview and mission of the AMHUB platform.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						Welcome to{" "}
						<strong className="text-[var(--color-text-primary)]">AMHUB</strong>{" "}
						(the &quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or
						&quot;us&quot;). AMHUB is a specialized creator hub and community
						discovery platform designed for video editors, motion designers, and
						creators who produce and share presets, XML project files, Google
						Drive links, and creative assets for{" "}
						<strong className="text-[var(--color-text-primary)]">
							Alight Motion
						</strong>
						.
					</p>
					<p>
						These Terms of Service (&quot;Terms&quot;) govern your access to and
						use of AMHUB, including our website, web applications, application
						programming interfaces (APIs), community features, and related
						services. Please read them thoroughly before exploring, uploading,
						or downloading any materials.
					</p>
				</div>
			),
		},
		{
			id: "acceptance",
			number: "02",
			title: "Acceptance of Terms",
			icon: Scale,
			summary: "Your agreement to comply with these Terms.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						By visiting, browsing, registering an account, or interacting with
						AMHUB in any manner, you acknowledge that you have read, understood,
						and agree to be legally bound by these Terms and our Privacy Policy.
					</p>
					<p>
						If you do not agree to these Terms in full, you must immediately
						discontinue use of the Platform. If you are using the Platform on
						behalf of an entity, team, or organization, you represent and
						warrant that you have the authority to bind that entity to these
						Terms.
					</p>
				</div>
			),
		},
		{
			id: "accounts",
			number: "03",
			title: "User Accounts",
			icon: Users,
			summary: "Registration, authentication, and credentials.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						While browsing public presets is open to everyone, certain
						features—such as publishing presets, liking, bookmarking,
						commenting, and following creators—require an AMHUB user account.
					</p>
					<ul className="list-disc list-inside space-y-1.5 pl-2 text-[var(--color-text-secondary)]">
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Account Security:
							</strong>{" "}
							You are solely responsible for maintaining the confidentiality of
							your authentication credentials and for all activities that occur
							under your account.
						</li>
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Accurate Information:
							</strong>{" "}
							You agree to provide accurate, current, and complete information
							during registration and to update your profile details as needed.
						</li>
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Single User Access:
							</strong>{" "}
							You may not share, sell, transfer, or allow other individuals
							unauthorized access to your account.
						</li>
					</ul>
				</div>
			),
		},
		{
			id: "responsibilities",
			number: "04",
			title: "User Responsibilities",
			icon: Shield,
			summary: "Standards of conduct for all community members.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						As a member of AMHUB, you commit to maintaining a respectful,
						lawful, and productive creative environment. You agree to:
					</p>
					<ul className="list-disc list-inside space-y-1.5 pl-2 text-[var(--color-text-secondary)]">
						<li>
							Comply with all applicable local, national, and international laws
							and regulations.
						</li>
						<li>
							Respect the intellectual property and attribution rights of fellow
							creators and music artists.
						</li>
						<li>
							Promptly notify our support team if you detect any security
							vulnerabilities or suspicious account activities.
						</li>
					</ul>
				</div>
			),
		},
		{
			id: "acceptable-use",
			number: "05",
			title: "Acceptable Use",
			icon: CheckCircle2,
			summary: "Permitted use cases for presets and assets.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						AMHUB is built to empower editors to enhance their video creation
						workflow in Alight Motion. Permitted activities include:
					</p>
					<ul className="list-disc list-inside space-y-1.5 pl-2 text-[var(--color-text-secondary)]">
						<li>
							Downloading and importing free community presets into Alight
							Motion for personal or commercial video editing projects.
						</li>
						<li>
							Uploading original XML files, transition packages, color grading
							setups, velocity curves, and effect templates that you authored or
							have explicit permission to distribute.
						</li>
						<li>
							Leaving constructive feedback, ratings, and comments on preset
							showcases.
						</li>
					</ul>
				</div>
			),
		},
		{
			id: "prohibited-activities",
			number: "06",
			title: "Prohibited Activities",
			icon: ShieldAlert,
			summary: "Zero-tolerance rules and forbidden behaviors.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						You agree <strong className="text-rose-400">NOT</strong> to engage
						in any of the following prohibited actions:
					</p>
					<ul className="list-disc list-inside space-y-1.5 pl-2 text-[var(--color-text-secondary)]">
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Plagiarism & Theft:
							</strong>{" "}
							Re-uploading another creator&apos;s XML or project files without
							substantial original modifications or explicit permission.
						</li>
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Malicious Payloads:
							</strong>{" "}
							Uploading or linking to corrupt XML files, malicious scripts,
							malware, phishing links, or deceptive redirect URLs.
						</li>
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Automated Scraping:
							</strong>{" "}
							Using bots, scrapers, automated crawlers, or unauthorized scripts
							to extract data or mass-download presets without API approval.
						</li>
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Harassment & Abuse:
							</strong>{" "}
							Posting hateful, harassing, sexually explicit, defamatory, or
							threatening comments or media anywhere on the Platform.
						</li>
						<li>
							<strong className="text-[var(--color-text-primary)]">
								Metric Manipulation:
							</strong>{" "}
							Faking downloads, likes, views, or follower counts using bots or
							deceptive automated networks.
						</li>
					</ul>
				</div>
			),
		},
		{
			id: "user-content",
			number: "07",
			title: "User-Generated Content",
			icon: Upload,
			summary: "Rights and licenses regarding uploaded presets.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						<strong className="text-[var(--color-text-primary)]">
							You retain full ownership
						</strong>{" "}
						of the original presets, project files, XML configurations, preview
						videos, and metadata that you author and publish on AMHUB.
					</p>
					<p>
						By submitting content to AMHUB, you grant us a worldwide,
						non-exclusive, royalty-free license to host, store, cache, display,
						reproduce, and distribute your content solely for the purpose of
						operating, promoting, and improving the Platform.
					</p>
					<p>
						You represent and warrant that you own or possess all necessary
						licenses, rights, and consents to publish your content and authorize
						AMHUB to distribute it.
					</p>
				</div>
			),
		},
		{
			id: "intellectual-property",
			number: "08",
			title: "Intellectual Property",
			icon: FileText,
			summary: "Platform branding and copyright infringement notices.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						All AMHUB platform code, visual designs, brand assets, logos, and
						user interface elements are the proprietary intellectual property of
						AMHUB and protected by applicable copyright and trademark laws.
					</p>
					<p>
						<strong className="text-[var(--color-text-primary)]">
							Alight Motion Disclaimer:
						</strong>{" "}
						AMHUB is an independent community hub and is{" "}
						<strong className="text-cyan-400">
							not affiliated with, endorsed by, or sponsored by Alight Creative,
							Inc.
						</strong>{" "}
						&quot;Alight Motion&quot; is a registered trademark of Alight
						Creative, Inc.
					</p>
					<p>
						If you believe that any preset or media on AMHUB infringes upon your
						copyright, please submit a takedown request to{" "}
						<code className="px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] text-[var(--color-interactive-primary)] text-xs">
							[CONTACT EMAIL]
						</code>{" "}
						with relevant proof of ownership.
					</p>
				</div>
			),
		},
		{
			id: "third-party",
			number: "09",
			title: "Third-Party Services",
			icon: Globe,
			summary: "External links, Google Drive, and cloud integrations.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						AMHUB may contain links to third-party websites, external Google
						Drive links, Sociabuzz creator support channels, TikTok/YouTube
						profiles, and cloud storage providers.
					</p>
					<p>
						We do not control and are not responsible for the availability,
						content, privacy policies, or practices of any third-party services.
						Accessing third-party resources is entirely at your own risk.
					</p>
				</div>
			),
		},
		{
			id: "privacy",
			number: "10",
			title: "Privacy",
			icon: Lock,
			summary: "How we collect, protect, and handle data.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						Your privacy is paramount to us. We only collect the minimal
						information necessary to deliver our services, authenticate
						accounts, prevent abuse, and track aggregated platform analytics.
					</p>
					<p>
						We do not sell your personal information to third parties. Network
						identifiers such as IP addresses are hashed using one-way
						cryptographic algorithms for rate limiting and download
						deduplication.
					</p>
				</div>
			),
		},
		{
			id: "availability",
			number: "11",
			title: "Service Availability",
			icon: Clock,
			summary: "Uptime, maintenance, and platform modifications.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						We strive to maintain continuous uptime and exceptional performance.
						However, AMHUB may experience occasional downtime due to scheduled
						maintenance, software upgrades, or infrastructure issues beyond our
						control.
					</p>
					<p>
						We reserve the right to modify, suspend, or discontinue any feature,
						preset category, or part of the Platform at any time with or without
						prior notice.
					</p>
				</div>
			),
		},
		{
			id: "termination",
			number: "12",
			title: "Account Suspension and Termination",
			icon: AlertTriangle,
			summary: "Conditions for terminating or disabling access.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						We reserve the right to suspend, disable, or permanently terminate
						your AMHUB account or restrict your access to the Platform at our
						sole discretion, without prior notice, if:
					</p>
					<ul className="list-disc list-inside space-y-1.5 pl-2 text-[var(--color-text-secondary)]">
						<li>You violate any provision of these Terms of Service.</li>
						<li>
							You engage in fraudulent, abusive, or copyright-infringing
							behavior.
						</li>
						<li>Required by law enforcement or relevant legal authorities.</li>
					</ul>
					<p>
						You may also delete your account at any time through your Profile or
						by contacting support.
					</p>
				</div>
			),
		},
		{
			id: "disclaimer",
			number: "13",
			title: "Disclaimer of Warranties",
			icon: Scale,
			summary: "Platform provided on an 'as-is' and 'as-available' basis.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p className="uppercase text-xs tracking-wider font-semibold text-[var(--color-text-tertiary)]">
						DISCLAIMER NOTICE
					</p>
					<p>
						AMHUB and all presets, XML files, templates, tutorials, and
						materials provided through the Platform are delivered on an{" "}
						<strong className="text-[var(--color-text-primary)]">
							&quot;AS IS&quot;
						</strong>{" "}
						and{" "}
						<strong className="text-[var(--color-text-primary)]">
							&quot;AS AVAILABLE&quot;
						</strong>{" "}
						basis, without warranties of any kind, whether express, implied,
						statutory, or otherwise.
					</p>
					<p>
						We do not guarantee that presets will be 100% compatible with every
						specific Alight Motion app build, OS version, or mobile hardware
						configuration.
					</p>
				</div>
			),
		},
		{
			id: "liability",
			number: "14",
			title: "Limitation of Liability",
			icon: Shield,
			summary: "Boundaries of legal responsibility.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						To the maximum extent permitted by applicable law, AMHUB and its
						operators, developers, and affiliates shall not be liable for any
						indirect, incidental, special, consequential, or punitive damages,
						including loss of profits, data corruption, device malfunction, or
						project file loss arising from your use or inability to use the
						Platform.
					</p>
				</div>
			),
		},
		{
			id: "changes",
			number: "15",
			title: "Changes to the Terms",
			icon: ScrollText,
			summary: "How and when these Terms are updated.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						We may revise and update these Terms of Service periodically to
						reflect evolving platform features, security improvements, or
						regulatory updates. When changes are made, we will update the
						&quot;Last Updated&quot; date at the top of this document.
					</p>
					<p>
						Your continued access to or use of AMHUB following the posting of
						updated Terms constitutes your binding acceptance of those
						revisions.
					</p>
				</div>
			),
		},
		{
			id: "contact",
			number: "16",
			title: "Contact Information",
			icon: Mail,
			summary: "How to reach the AMHUB team for inquiries.",
			content: (
				<div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
					<p>
						If you have questions, feedback, copyright inquiries, or concerns
						regarding these Terms of Service, please reach out to us:
					</p>
					<div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] space-y-2">
						<div className="flex items-center gap-2 text-xs text-[var(--color-text-primary)] font-semibold">
							<Mail className="w-4 h-4 text-[var(--color-interactive-primary)]" />
							<span>
								Email Support:{" "}
								<code className="px-2 py-0.5 rounded bg-[var(--color-bg-base)] text-[var(--color-text-accent)]">
									[CONTACT EMAIL]
								</code>
							</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-[var(--color-text-primary)] font-semibold">
							<Globe className="w-4 h-4 text-[var(--color-interactive-primary)]" />
							<span>
								Creator Support:{" "}
								<a
									href="https://sociabuzz.com/anonimbro"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--color-interactive-primary)] hover:underline"
								>
									SociaBuzz AnonimBRO
								</a>
							</span>
						</div>
					</div>
				</div>
			),
		},
	];

	const scrollToSection = (id: string) => {
		setActiveSection(id);
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-16 space-y-8 font-body">
			{/* Top Navigation & Breadcrumb */}
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={handleBack}
					className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-white transition-all active:scale-95 shadow-sm"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back</span>
				</button>

				<div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
					<Link href="/" className="hover:text-white transition-colors">
						Home
					</Link>
					<span>/</span>
					<span className="text-[var(--color-interactive-primary)] font-semibold">
						Terms of Service
					</span>
				</div>
			</div>

			{/* Hero Header Banner */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/40 via-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-border-subtle)] p-6 sm:p-10 shadow-2xl space-y-4">
				{/* Ambient Glows */}
				<div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

				<div className="relative z-10 space-y-3 max-w-3xl">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
						<Sparkles className="w-3.5 h-3.5" />
						<span>Legal & Community Guidelines</span>
					</div>

					<h1 className="font-['Syne',sans-serif] font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
						Terms of Service
					</h1>

					<p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
						Clear, transparent, and fair guidelines for exploring, sharing, and
						creating Alight Motion presets on AMHUB.
					</p>

					<div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[var(--color-text-tertiary)] font-medium">
						<div className="flex items-center gap-1.5">
							<Clock className="w-4 h-4 text-[var(--color-interactive-primary)]" />
							<span>Last Updated: August 2026</span>
						</div>
						<div className="flex items-center gap-1.5">
							<FileText className="w-4 h-4 text-emerald-400" />
							<span>16 Comprehensive Sections</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Layout with Sticky Sidebar */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* Table of Contents - Desktop Sticky Sidebar */}
				<aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-3">
					<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg space-y-4">
						<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] font-display">
							<ScrollText className="w-4 h-4 text-[var(--color-interactive-primary)]" />
							<span>Table of Contents</span>
						</div>

						<nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
							{sections.map((sec) => {
								const Icon = sec.icon;
								const isActive = activeSection === sec.id;
								return (
									<button
										key={sec.id}
										type="button"
										onClick={() => scrollToSection(sec.id)}
										className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
											isActive
												? "bg-[var(--color-interactive-primary)]/15 text-[var(--color-interactive-primary)] font-bold border border-[var(--color-interactive-primary)]/30"
												: "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
										}`}
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<span className="text-[10px] font-mono text-[var(--color-text-tertiary)] shrink-0">
												{sec.number}
											</span>
											<span className="truncate">{sec.title}</span>
										</div>
										<ChevronRight
											className={`w-3.5 h-3.5 shrink-0 transition-transform ${
												isActive
													? "text-[var(--color-interactive-primary)] translate-x-0.5"
													: "opacity-40"
											}`}
										/>
									</button>
								);
							})}
						</nav>
					</div>
				</aside>

				{/* Sections Content Area */}
				<main className="lg:col-span-8 space-y-6">
					{sections.map((sec) => {
						const Icon = sec.icon;
						return (
							<section
								key={sec.id}
								id={sec.id}
								className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-sm hover:border-[var(--color-border-default)] transition-colors space-y-4 relative overflow-hidden group"
							>
								{/* Header */}
								<div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-4">
									<div className="flex items-center gap-3">
										<div className="p-2.5 rounded-2xl bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20 shadow-sm shrink-0">
											<Icon className="w-5 h-5" />
										</div>
										<div>
											<span className="text-[10px] font-mono font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
												Section {sec.number}
											</span>
											<h2 className="font-['Syne',sans-serif] font-display text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
												{sec.title}
											</h2>
										</div>
									</div>
								</div>

								{/* Content Body */}
								<div>{sec.content}</div>
							</section>
						);
					})}

					{/* Bottom Reaffirmation Box */}
					<div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-900/30 via-sky-900/20 to-[var(--color-bg-surface)] border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
						<div className="space-y-1 text-center sm:text-left">
							<h3 className="font-['Syne',sans-serif] font-display text-base sm:text-lg font-bold text-white">
								Ready to start exploring?
							</h3>
							<p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
								Discover thousands of free community presets or share your
								creations with fellow editors.
							</p>
						</div>
						<div className="flex items-center gap-3 shrink-0">
							<Link
								href="/explore"
								className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-interactive-primary)] to-cyan-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md active:scale-95"
							>
								Explore Presets
							</Link>
							<Link
								href="/auth/register"
								className="px-5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all active:scale-95"
							>
								Create Account
							</Link>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
