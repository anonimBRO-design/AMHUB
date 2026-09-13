"use client";

import { Music, Sparkles, UserPlus } from "lucide-react";

interface GrowthStepProps {
	isPaid: boolean;
	enableSocialLock: boolean;
	onEnableSocialLockChange: (enabled: boolean) => void;
	tiktokSoundTitle: string;
	onTiktokSoundTitleChange: (title: string) => void;
	tiktokSoundUrl: string;
	onTiktokSoundUrlChange: (url: string) => void;
	sultanPackUrl: string;
	onSultanPackUrlChange: (url: string) => void;
}

export function GrowthStep({
	isPaid,
	enableSocialLock,
	onEnableSocialLockChange,
	tiktokSoundTitle,
	onTiktokSoundTitleChange,
	tiktokSoundUrl,
	onTiktokSoundUrlChange,
	sultanPackUrl,
	onSultanPackUrlChange,
}: GrowthStepProps) {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
					<Sparkles className="w-5 h-5" />
				</div>
				<div>
					<h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
						<span>Growth & Extra Monetization</span>
						<span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
							BOOSTER
						</span>
					</h3>
					<p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
						Atur fitur viralitas, sound TikTok, dan paket mentahan komplit biar
						preset lu makin cuan & viral.
					</p>
				</div>
			</div>

			{/* 1. Social Lock Toggle (Only if Free preset) */}
			{!isPaid && (
				<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-2">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2.5">
							<UserPlus className="w-4 h-4 text-indigo-400 shrink-0" />
							<div>
								<span className="block text-xs font-bold text-[var(--color-text-primary)]">
									Wajib Follow untuk Download (Social Lock)
								</span>
								<span className="block text-[11px] text-[var(--color-text-secondary)]">
									Pengguna harus follow akunmu di AMHUB sebelum tombol download
									terbuka.
								</span>
							</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer shrink-0">
							<input
								type="checkbox"
								checked={enableSocialLock}
								onChange={(e) => onEnableSocialLockChange(e.target.checked)}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
						</label>
					</div>
				</div>
			)}

			{isPaid && (
				<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-indigo-500/20 space-y-2">
					<div className="flex items-center gap-2.5">
						<UserPlus className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
						<div>
							<span className="block text-xs font-bold text-[var(--color-text-tertiary)]">
								Social Lock (Tidak tersedia untuk preset berbayar)
							</span>
							<span className="block text-[11px] text-[var(--color-text-tertiary)]">
								Social Lock hanya berlaku untuk preset gratis.
							</span>
						</div>
					</div>
				</div>
			)}

			{/* 2. TikTok Sound Matcher Fields */}
			<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-3">
				<div className="flex items-center gap-2">
					<Music className="w-4 h-4 text-cyan-400" />
					<div>
						<span className="block text-xs font-bold text-[var(--color-text-primary)]">
							TikTok Sound / Soundtrack Matcher
						</span>
						<span className="block text-[11px] text-[var(--color-text-secondary)]">
							Biar pengunjung bisa dengerin preview & langsung pakai sound asli
							di TikTok.
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
					<div className="space-y-1">
						<label
							htmlFor="upload-tiktok-sound-title"
							className="text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]"
						>
							Judul Sound / Musik
						</label>
						<input
							id="upload-tiktok-sound-title"
							type="text"
							maxLength={80}
							value={tiktokSoundTitle}
							onChange={(e) => onTiktokSoundTitleChange(e.target.value)}
							placeholder="cth. DJ Dalinda Mengkane"
							className="w-full min-h-[42px] px-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-cyan-500"
						/>
					</div>
					<div className="space-y-1">
						<label
							htmlFor="upload-tiktok-sound-url"
							className="text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]"
						>
							Link Sound di TikTok (Opsional)
						</label>
						<input
							id="upload-tiktok-sound-url"
							type="url"
							value={tiktokSoundUrl}
							onChange={(e) => onTiktokSoundUrlChange(e.target.value)}
							placeholder="https://vt.tiktok.com/..."
							className="w-full min-h-[42px] px-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-sans focus:outline-none focus:border-cyan-500"
						/>
					</div>
				</div>
			</div>

			{/* 3. Paket Sultan / All-in-One Asset Pack */}
			<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-amber-500/20 space-y-2">
				<div className="flex items-center gap-2">
					<span className="text-sm">💎</span>
					<div>
						<span className="block text-xs font-bold text-[var(--color-text-primary)]">
							Link Paket Sultan / Mentahan Full (Opsional)
						</span>
						<span className="block text-[11px] text-[var(--color-text-secondary)]">
							Link Google Drive / MediaFire file mentahan (Video 4K + Sound HD +
							Font Zip).
						</span>
					</div>
				</div>
				<input
					id="upload-sultan-pack-url"
					type="url"
					value={sultanPackUrl}
					onChange={(e) => onSultanPackUrlChange(e.target.value)}
					placeholder="https://drive.google.com/file/d/..."
					className="w-full min-h-[42px] px-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-sans focus:outline-none focus:border-amber-500"
				/>
			</div>

			{/* 4. Jasa Joki / Commission Edit */}
			<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-cyan-500/20 space-y-2">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2.5">
						<span className="text-base">💼</span>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-[var(--color-text-primary)]">
									Jasa Joki / Commission Edit Preset
								</span>
								<span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
									OTOMATIS AKTIF ✨
								</span>
							</div>
							<span className="block text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
								Tombol <strong>&quot;Order Jasa Joki&quot;</strong> otomatis dipasang di halaman preset lu. Pengunjung yang mager ngedit bisa langsung klik buat sewa lu bikin preset custom via sistem <strong className="text-cyan-400 font-mono">/requests</strong> AMHUB!
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Info callout */}
			<div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
				<span className="font-bold text-indigo-400">💡 Tips:</span> Semua
				field di step ini fleksibel. Social Lock bantu naikin follower akunmu,
				sound TikTok bantu naikin views, dan Paket Sultan + Jasa Joki bantu naikin cuan riil!
			</div>
		</div>
	);
}
