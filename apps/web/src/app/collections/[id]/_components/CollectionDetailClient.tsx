"use client";

import { useAuth } from "@/context/AuthContext";
import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import {
	ArrowLeft,
	Check,
	Copy,
	Globe,
	Link2,
	Lock,
	Plus,
	Share2,
	Trash2,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CollectionDetailClientProps {
	collection: {
		id: string;
		title: string;
		description: string | null;
		coverUrl: string | null;
		isPublic: boolean;
		owner: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
		};
	};
	presets: PresetCardPreset[];
	collaborators: {
		userId: string;
		username: string;
		displayName: string;
		avatarUrl: string | null;
	}[];
	isOwner: boolean;
	canEdit: boolean;
}

function extractPresetRef(input: string): { id?: string; slug?: string } {
	const trimmed = input.trim();
	if (!trimmed) return {};
	const uuidMatch = trimmed.match(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
	);
	if (uuidMatch) return { id: trimmed };
	const slugMatch = trimmed.match(/\/preset\/([A-Za-z0-9-]+)/);
	if (slugMatch?.[1]) return { slug: slugMatch[1] };
	if (/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(trimmed))
		return { slug: trimmed };
	return {};
}

export function CollectionDetailClient({
	collection,
	presets,
	collaborators: initialCollaborators,
	isOwner,
	canEdit,
}: CollectionDetailClientProps) {
	const router = useRouter();
	const { requireAuth } = useAuth();
	const [copied, setCopied] = useState(false);
	const [shared, setShared] = useState(false);
	const [manageOpen, setManageOpen] = useState(false);
	const [addInput, setAddInput] = useState("");
	const [adding, setAdding] = useState(false);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [collaborators, setCollaborators] = useState(initialCollaborators);
	const [inviteName, setInviteName] = useState("");
	const [inviting, setInviting] = useState(false);
	const [removingUserId, setRemovingUserId] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const pageUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/collections/${collection.id}`
			: "";

	const handleCopy = async () => {
		if (!pageUrl) return;
		try {
			await navigator.clipboard.writeText(pageUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setNotice("Gagal menyalin link.");
		}
	};

	const handleShare = async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: `${collection.title} | AMHUB`,
					text: `Koleksi preset Alight Motion: ${collection.title}`,
					url: pageUrl,
				});
				setShared(true);
				setTimeout(() => setShared(false), 2000);
				return;
			} catch {
				// user cancelled — fall through to copy
			}
		}
		handleCopy();
	};

	const handleAdd = async () => {
		if (!requireAuth(undefined, "Login untuk menambah preset")) return;
		const ref = extractPresetRef(addInput);
		if (!ref.id && !ref.slug) {
			setNotice("Tempel link preset atau slug yang valid.");
			return;
		}
		setAdding(true);
		setNotice(null);
		try {
			const res = await fetch(`/api/collections/${collection.id}/items`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(
					ref.id ? { preset_id: ref.id } : { preset_slug: ref.slug },
				),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(json?.error?.message || "Gagal menambah preset.");
			}
			setAddInput("");
			setNotice("Preset ditambahkan ke koleksi.");
			router.refresh();
		} catch (err) {
			setNotice(err instanceof Error ? err.message : "Gagal menambah preset.");
		} finally {
			setAdding(false);
		}
	};

	const handleRemove = async (presetId: string) => {
		setRemovingId(presetId);
		try {
			const res = await fetch(`/api/collections/${collection.id}/items`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ preset_id: presetId }),
			});
			if (!res.ok) throw new Error("Gagal menghapus preset.");
			router.refresh();
		} catch {
			setNotice("Gagal menghapus preset dari koleksi.");
		} finally {
			setRemovingId(null);
		}
	};

	const handleInvite = async () => {
		const username = inviteName.replace(/^@/, "").trim();
		if (!username) return;
		setInviting(true);
		setNotice(null);
		try {
			const res = await fetch(
				`/api/collections/${collection.id}/collaborators`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username }),
				},
			);
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(json?.error?.message || "Gagal menambah kolaborator.");
			}
			setInviteName("");
			setNotice(`@${username} ditambahkan sebagai kolaborator.`);
			router.refresh();
		} catch (err) {
			setNotice(
				err instanceof Error ? err.message : "Gagal menambah kolaborator.",
			);
		} finally {
			setInviting(false);
		}
	};

	const handleRemoveCollaborator = async (userId: string) => {
		setRemovingUserId(userId);
		try {
			const res = await fetch(
				`/api/collections/${collection.id}/collaborators`,
				{
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ user_id: userId }),
				},
			);
			if (!res.ok) throw new Error();
			setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
		} catch {
			setNotice("Gagal menghapus kolaborator.");
		} finally {
			setRemovingUserId(null);
		}
	};

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-0 space-y-8">
			<button
				type="button"
				onClick={() => router.push("/collections")}
				className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-white transition-all active:scale-95"
			>
				<ArrowLeft className="w-4 h-4" />
				<span>Semua Koleksi</span>
			</button>

			{/* Header */}
			<div className="relative overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				{collection.coverUrl && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={collection.coverUrl}
						alt={collection.title}
						className="w-full h-40 sm:h-56 object-cover"
					/>
				)}
				<div className="p-6 sm:p-8 space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						{collection.isPublic ? (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
								<Globe className="w-3 h-3" />
								Publik
							</span>
						) : (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
								<Lock className="w-3 h-3" />
								Privat
							</span>
						)}
						{collaborators.length > 0 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
								<Users className="w-3 h-3" />
								Kolaborasi • {collaborators.length}
							</span>
						)}
						<span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
							{presets.length} preset
						</span>
					</div>
					<div>
						<h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
							{collection.title}
						</h1>
						{collection.description && (
							<p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-2xl">
								{collection.description}
							</p>
						)}
					</div>
					<div className="flex flex-wrap items-center gap-3 pt-1">
						<span className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
							<span className="font-semibold text-[var(--color-text-primary)]">
								@{collection.owner.username}
							</span>
							<span>• pemilik</span>
						</span>
						<div className="flex items-center gap-2 ml-auto">
							<button
								type="button"
								onClick={handleCopy}
								className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-text-primary)] transition-all active:scale-95"
							>
								{copied ? (
									<>
										<Check className="w-4 h-4 text-emerald-400" />
										<span className="text-emerald-400">Tersalin!</span>
									</>
								) : (
									<>
										<Copy className="w-4 h-4" />
										<span>Salin Link</span>
									</>
								)}
							</button>
							<button
								type="button"
								onClick={handleShare}
								className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[var(--color-interactive-primary)] hover:bg-[var(--color-interactive-primary-hover)] text-white text-xs font-bold transition-all active:scale-95"
							>
								<Share2 className="w-4 h-4" />
								<span>{shared ? "Terkirim!" : "Bagikan"}</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			{notice && (
				<p className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-3">
					{notice}
				</p>
			)}

			{/* Editor tools */}
			{canEdit && (
				<div className="space-y-3">
					<button
						type="button"
						onClick={() => setManageOpen((v) => !v)}
						className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-interactive-primary)] hover:underline"
					>
						{manageOpen ? (
							<X className="w-4 h-4" />
						) : (
							<Plus className="w-4 h-4" />
						)}
						{manageOpen ? "Tutup Kelola" : "Kelola Koleksi"}
					</button>

					{manageOpen && (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Add preset */}
							<div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3">
								<h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
									<Link2 className="w-4 h-4 text-cyan-400" />
									Tambah Preset
								</h3>
								<div className="flex gap-2">
									<input
										type="text"
										value={addInput}
										onChange={(e) => setAddInput(e.target.value)}
										placeholder="Tempel link /preset/slug atau ID"
										className="flex-1 min-h-[44px] px-4 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-sans focus:outline-none focus:border-[var(--color-interactive-primary)]"
									/>
									<button
										type="button"
										disabled={adding || !addInput.trim()}
										onClick={handleAdd}
										className="px-5 min-h-[44px] rounded-xl bg-[var(--color-interactive-primary)] text-white text-xs font-bold disabled:opacity-50 shrink-0"
									>
										{adding ? "..." : "Tambah"}
									</button>
								</div>
								{/* Remove list */}
								<div className="space-y-1.5 max-h-64 overflow-y-auto pt-1">
									{presets.length === 0 && (
										<p className="text-[11px] text-[var(--color-text-tertiary)]">
											Belum ada preset di koleksi ini.
										</p>
									)}
									{presets.map((p) => (
										<div
											key={p.id}
											className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]"
										>
											<span className="flex-1 text-xs font-semibold text-[var(--color-text-primary)] truncate">
												{p.title}
											</span>
											<button
												type="button"
												disabled={removingId === p.id}
												onClick={() => handleRemove(p.id)}
												className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
												aria-label={`Hapus ${p.title}`}
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									))}
								</div>
							</div>

							{/* Collaborators (owner only) */}
							{isOwner ? (
								<div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3">
									<h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
										<UserPlus className="w-4 h-4 text-cyan-400" />
										Kolaborator
									</h3>
									<div className="flex gap-2">
										<input
											type="text"
											value={inviteName}
											onChange={(e) => setInviteName(e.target.value)}
											placeholder="username, cth. afganedits"
											className="flex-1 min-h-[44px] px-4 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
										/>
										<button
											type="button"
											disabled={inviting || !inviteName.trim()}
											onClick={handleInvite}
											className="px-5 min-h-[44px] rounded-xl bg-[var(--color-interactive-primary)] text-white text-xs font-bold disabled:opacity-50 shrink-0"
										>
											{inviting ? "..." : "Undang"}
										</button>
									</div>
									<div className="space-y-1.5">
										{collaborators.length === 0 && (
											<p className="text-[11px] text-[var(--color-text-tertiary)]">
												Belum ada kolaborator. Kolaborator bisa menambah dan
												menghapus preset di koleksi ini.
											</p>
										)}
										{collaborators.map((c) => (
											<div
												key={c.userId}
												className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]"
											>
												<span className="flex-1 text-xs font-semibold text-[var(--color-text-primary)] truncate">
													@{c.username}
												</span>
												<button
													type="button"
													disabled={removingUserId === c.userId}
													onClick={() => handleRemoveCollaborator(c.userId)}
													className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
													aria-label={`Hapus ${c.username}`}
												>
													<X className="w-4 h-4" />
												</button>
											</div>
										))}
									</div>
								</div>
							) : (
								collaborators.length > 0 && (
									<div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-2">
										<h3 className="text-sm font-bold text-[var(--color-text-primary)]">
											Kolaborator
										</h3>
										{collaborators.map((c) => (
											<p
												key={c.userId}
												className="text-xs text-[var(--color-text-secondary)]"
											>
												@{c.username}
											</p>
										))}
									</div>
								)
							)}
						</div>
					)}
				</div>
			)}

			{/* Items grid */}
			<section className="space-y-4">
				<h2 className="font-display text-xl font-bold text-white px-1">
					Isi Koleksi
				</h2>
				{presets.length > 0 ? (
					<PresetGrid
						presets={presets}
						isLoading={false}
						hasMore={false}
						onLoadMore={() => {}}
					/>
				) : (
					<div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-center">
						<p className="text-sm font-bold text-[var(--color-text-primary)]">
							Koleksi ini masih kosong
						</p>
						<p className="text-xs text-[var(--color-text-secondary)] mt-1">
							{canEdit
								? "Tambahkan preset pertama lewat menu Kelola di atas."
								: "Pemilik belum menambahkan preset."}
						</p>
					</div>
				)}
			</section>
		</div>
	);
}
