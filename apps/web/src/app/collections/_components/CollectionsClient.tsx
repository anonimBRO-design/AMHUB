"use client";

import {
	Edit3,
	FolderPlus,
	Globe,
	Layers,
	Lock,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";

interface CollectionItem {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	cover_url: string | null;
	is_public: boolean;
	preset_count: number;
	created_at: string;
}

interface CollectionsClientProps {
	initialCollections: CollectionItem[];
	currentUserId: string;
}

export function CollectionsClient({
	initialCollections,
}: CollectionsClientProps) {
	const [collections, setCollections] =
		useState<CollectionItem[]>(initialCollections);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/collections", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim() || undefined,
					is_public: isPublic,
				}),
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.message || "Failed to create collection");
			}

			const newColl = await res.json();
			setCollections([newColl, ...collections]);
			setTitle("");
			setDescription("");
			setIsPublic(true);
			setIsCreateOpen(false);
		} catch (err: any) {
			setError(err.message || "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this collection?")) return;

		try {
			const res = await fetch(`/api/collections/${id}`, {
				method: "DELETE",
			});

			if (!res.ok) throw new Error("Failed to delete collection");
			setCollections(collections.filter((c) => c.id !== id));
		} catch (err: any) {
			alert(err.message || "Could not delete collection");
		}
	};

	return (
		<div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
							<Layers className="w-8 h-8 text-[var(--color-interactive-primary)]" />
							My Collections
						</h1>
						<p className="text-sm text-[var(--color-text-secondary)] mt-1">
							Organize your favorite Alight Motion presets into custom themes
							and folders.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsCreateOpen(true)}
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-interactive-primary)] hover:bg-[var(--color-interactive-primary-hover)] text-white font-bold text-sm shadow-lg transition-all active:scale-95"
					>
						<Plus className="w-4 h-4" />
						Create Collection
					</button>
				</div>

				{/* Create Modal */}
				{isCreateOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
						<div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-5">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-bold flex items-center gap-2">
									<FolderPlus className="w-5 h-5 text-[var(--color-interactive-primary)]" />
									New Collection
								</h2>
								<button
									type="button"
									onClick={() => setIsCreateOpen(false)}
									className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<form onSubmit={handleCreate} className="space-y-4">
								<div>
									<label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
										Title *
									</label>
									<input
										type="text"
										required
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="e.g. Velocity Transitions 2026"
										className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] text-sm text-[var(--color-text-primary)] outline-none"
									/>
								</div>

								<div>
									<label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
										Description (optional)
									</label>
									<textarea
										rows={3}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Add a brief description..."
										className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] focus:border-[var(--color-interactive-primary)] text-sm text-[var(--color-text-primary)] outline-none resize-none"
									/>
								</div>

								<div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
									<div className="flex items-center gap-2">
										{isPublic ? (
											<Globe className="w-4 h-4 text-emerald-400" />
										) : (
											<Lock className="w-4 h-4 text-amber-400" />
										)}
										<span className="text-xs font-semibold">
											{isPublic ? "Public Collection" : "Private Collection"}
										</span>
									</div>
									<input
										type="checkbox"
										checked={isPublic}
										onChange={(e) => setIsPublic(e.target.checked)}
										className="h-4 w-4 accent-[var(--color-interactive-primary)] cursor-pointer"
									/>
								</div>

								{error && (
									<p className="text-xs text-[var(--color-text-error)]">
										{error}
									</p>
								)}

								<div className="flex items-center justify-end gap-3 pt-2">
									<button
										type="button"
										onClick={() => setIsCreateOpen(false)}
										className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isLoading}
										className="px-5 py-2.5 rounded-xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-md hover:bg-[var(--color-interactive-primary-hover)] disabled:opacity-50"
									>
										{isLoading ? "Creating..." : "Save Collection"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Collections Grid */}
				{collections.length === 0 ? (
					<div className="text-center py-16 px-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
						<div className="inline-flex p-4 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
							<Layers className="w-10 h-10" />
						</div>
						<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
							No collections yet
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
							Create your first collection to group and share your favorite
							Alight Motion presets.
						</p>
						<button
							type="button"
							onClick={() => setIsCreateOpen(true)}
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-md hover:bg-[var(--color-interactive-primary-hover)]"
						>
							<Plus className="w-4 h-4" />
							Create First Collection
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{collections.map((col) => (
							<div
								key={col.id}
								className="group relative rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-5 space-y-4 hover:border-[var(--color-border-strong)] transition-all shadow-sm hover:shadow-md"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2.5">
										<div className="p-2.5 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-interactive-primary)]">
											<Layers className="w-5 h-5" />
										</div>
										<div>
											<h3 className="font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors">
												{col.title}
											</h3>
											<span className="text-xs text-[var(--color-text-secondary)]">
												{col.preset_count} presets
											</span>
										</div>
									</div>

									<div className="flex items-center gap-1.5">
										<span
											className={`p-1.5 rounded-lg border text-xs ${
												col.is_public
													? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
													: "bg-amber-500/10 text-amber-400 border-amber-500/20"
											}`}
											title={col.is_public ? "Public" : "Private"}
										>
											{col.is_public ? (
												<Globe className="w-3.5 h-3.5" />
											) : (
												<Lock className="w-3.5 h-3.5" />
											)}
										</span>

										<button
											type="button"
											onClick={() => handleDelete(col.id)}
											className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
											title="Delete collection"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>

								{col.description && (
									<p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
										{col.description}
									</p>
								)}

								<div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
									<span>
										Created{" "}
										{new Date(col.created_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</span>
									<a
										href={`/collections/${col.id}`}
										className="font-bold text-[var(--color-interactive-primary)] hover:underline"
									>
										View Items &rarr;
									</a>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
