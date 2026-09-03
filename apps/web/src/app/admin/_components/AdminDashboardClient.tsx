"use client";

import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import type { User as Profile } from "@presethub/types";
import {
	AlertTriangle,
	Banknote,
	CheckCircle2,
	Clock,
	Loader2,
	Mail,
	MessageSquare,
	RefreshCw,
	Search,
	ShieldAlert,
	ShieldCheck,
	ShieldX,
	Sparkles,
	Trash2,
	UserCheck,
	UserX,
	Users,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { CreatorPermissionsTab } from "./CreatorPermissionsTab";
import { ReportsModerationTab } from "./ReportsModerationTab";
import { WithdrawalsAdminTab } from "./WithdrawalsAdminTab";

interface AdminUserRecord {
	id: string;
	username: string;
	display_name: string;
	email: string;
	role?: string | null;
	avatar_url?: string | null;
	level: number;
	is_staff: boolean;
	is_verified: boolean;
	created_at: string;
	updated_at: string;
}

interface AdminDashboardClientProps {
	currentAdmin: Profile;
}

export function AdminDashboardClient({
	currentAdmin,
}: AdminDashboardClientProps) {
	const [activeTab, setActiveTab] = useState<
		"users" | "creator_permissions" | "reports" | "withdrawals"
	>("users");
	const [users, setUsers] = useState<AdminUserRecord[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Delete Modal State
	const [targetUser, setTargetUser] = useState<AdminUserRecord | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// Verification Modal State
	const [verifyTarget, setVerifyTarget] = useState<{
		user: AdminUserRecord;
		targetStatus: boolean;
	} | null>(null);
	const [isVerifying, setIsVerifying] = useState<boolean>(false);
	const [verifyError, setVerifyError] = useState<string | null>(null);

	// Role Promotion/Demotion Modal State
	const [roleTarget, setRoleTarget] = useState<{
		user: AdminUserRecord;
		targetRole: "admin" | "user";
	} | null>(null);
	const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
	const [roleError, setRoleError] = useState<string | null>(null);

	const fetchUsers = useCallback(async (query = "") => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/admin/users?q=${encodeURIComponent(query)}`,
			);
			const json = await res.json();
			if (!res.ok) {
				const details =
					json.error?.message ||
					json.error?.code ||
					`HTTP ${res.status} ${res.statusText}`;
				throw new Error(`[HTTP ${res.status}] ${details}`);
			}
			setUsers(json.data?.users || []);
			setTotalCount(json.data?.total_count || 0);
		} catch (err) {
			console.error("Fetch admin users failed:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load user list.",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchUsers(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, fetchUsers]);

	const handleDeleteConfirm = async () => {
		if (!targetUser) return;
		setIsDeleting(true);
		setDeleteError(null);

		try {
			const res = await fetch("/api/admin/users", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: targetUser.id }),
			});
			const json = await res.json();

			if (!res.ok) {
				throw new Error(json.error?.message || "Failed to delete user.");
			}

			setToast({
				type: "success",
				message: `User @${targetUser.username} permanently deleted.`,
			});
			setTargetUser(null);
			fetchUsers(searchQuery);
		} catch (err) {
			console.error("Delete user failed:", err);
			setDeleteError(
				err instanceof Error ? err.message : "Failed to delete user.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleVerifyConfirm = async () => {
		if (!verifyTarget) return;
		setIsVerifying(true);
		setVerifyError(null);

		const { user: target, targetStatus } = verifyTarget;

		try {
			const res = await fetch("/api/admin/users/verify", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: target.id,
					is_verified: targetStatus,
				}),
			});
			const json = await res.json();

			if (!res.ok) {
				throw new Error(
					json.error?.message || "Failed to update verification status.",
				);
			}

			// Update users state locally with zero full page reload
			setUsers((prev) =>
				prev.map((u) =>
					u.id === target.id ? { ...u, is_verified: targetStatus } : u,
				),
			);

			setToast({
				type: "success",
				message: `Account @${target.username} ${targetStatus ? "verified" : "unverified"} successfully.`,
			});
			setVerifyTarget(null);
		} catch (err) {
			console.error("Verify user failed:", err);
			setVerifyError(
				err instanceof Error
					? err.message
					: "Failed to update verification status.",
			);
		} finally {
			setIsVerifying(false);
		}
	};

	const handleRoleConfirm = async () => {
		if (!roleTarget) return;
		setIsUpdatingRole(true);
		setRoleError(null);

		const { user: target, targetRole } = roleTarget;

		try {
			const res = await fetch("/api/admin/users/role", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: target.id,
					username: target.username,
					role: targetRole,
				}),
			});
			const json = await res.json();

			if (!res.ok) {
				throw new Error(json.error?.message || "Failed to update user role.");
			}

			// Optimistic local state update
			setUsers((prev) =>
				prev.map((u) =>
					u.id === target.id
						? {
								...u,
								role: targetRole,
								is_staff: targetRole === "admin",
							}
						: u,
				),
			);

			setToast({
				type: "success",
				message: `Account @${target.username} ${
					targetRole === "admin"
						? "dijadikan Admin"
						: "dicabut status Admin-nya"
				} berhasil.`,
			});
			setRoleTarget(null);
		} catch (err) {
			console.error("Role update failed:", err);
			setRoleError(
				err instanceof Error ? err.message : "Failed to update user role.",
			);
		} finally {
			setIsUpdatingRole(false);
		}
	};

	const adminCount = users.filter(
		(u) =>
			u.username.toLowerCase() === "afgan" || u.role === "admin" || u.is_staff,
	).length;

	const verifiedCount = users.filter((u) => u.is_verified).length;

	return (
		<div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
			{/* Toast Banner */}
			{toast && (
				<div
					className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4 ${
						toast.type === "success"
							? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
							: "bg-rose-500/10 text-rose-400 border-rose-500/20"
					}`}
				>
					{toast.type === "success" ? (
						<CheckCircle2 className="w-5 h-5 shrink-0" />
					) : (
						<AlertTriangle className="w-5 h-5 shrink-0" />
					)}
					<span>{toast.message}</span>
					<button
						type="button"
						onClick={() => setToast(null)}
						className="ml-2 text-xs opacity-70 hover:opacity-100"
					>
						✕
					</button>
				</div>
			)}

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[var(--color-bg-surface)] to-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-interactive-primary)]">
						<ShieldAlert className="w-4 h-4" />
						<span>Admin System Portal</span>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						User Management & Security
					</h1>
					<p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
						Logged in as{" "}
						<span className="font-bold text-white">
							@{currentAdmin.username}
						</span>{" "}
						(System Administrator)
					</p>
				</div>

				<button
					type="button"
					onClick={() => {
						if (activeTab === "users") {
							fetchUsers(searchQuery);
						}
					}}
					disabled={isLoading && activeTab === "users"}
					className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-base)] text-xs font-semibold text-[var(--color-text-primary)] transition-all active:scale-95 disabled:opacity-50"
				>
					<RefreshCw
						className={`w-4 h-4 ${isLoading && activeTab === "users" ? "animate-spin" : ""}`}
					/>
					<span>Refresh</span>
				</button>
			</div>

			{/* Main Module Tabs Navigation */}
			<div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] w-fit shadow-sm">
				<button
					type="button"
					onClick={() => setActiveTab("users")}
					className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
						activeTab === "users"
							? "bg-[var(--color-interactive-primary)] text-white shadow-md shadow-purple-950/30"
							: "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/[0.04]"
					}`}
				>
					<Users className="w-4 h-4" />
					<span>User Management</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("creator_permissions")}
					className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
						activeTab === "creator_permissions"
							? "bg-[var(--color-interactive-primary)] text-white shadow-md shadow-purple-950/30"
							: "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/[0.04]"
					}`}
				>
					<Sparkles className="w-4 h-4 text-purple-300" />
					<span>Creator Permissions & Outreach</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("reports")}
					className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
						activeTab === "reports"
							? "bg-[var(--color-interactive-primary)] text-white shadow-md shadow-purple-950/30"
							: "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/[0.04]"
					}`}
				>
					<ShieldAlert className="w-4 h-4 text-amber-300" />
					<span>Moderasi Konten & Preset</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("withdrawals")}
					className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
						activeTab === "withdrawals"
							? "bg-[var(--color-interactive-primary)] text-white shadow-md shadow-purple-950/30"
							: "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/[0.04]"
					}`}
				>
					<Banknote className="w-4 h-4 text-emerald-300" />
					<span>Payout Creator</span>
				</button>
			</div>

			{/* Tab 1: User Management */}
			{activeTab === "users" && (
				<div className="space-y-6 animate-in fade-in duration-200">
					{/* Summary Stats Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md space-y-1">
							<div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-secondary)]">
								<span>Total Users</span>
								<Users className="w-4 h-4 text-purple-400" />
							</div>
							<div className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)]">
								{totalCount}
							</div>
						</div>

						<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md space-y-1">
							<div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-secondary)]">
								<span>Admin Accounts</span>
								<ShieldCheck className="w-4 h-4 text-amber-400" />
							</div>
							<div className="text-2xl sm:text-3xl font-black text-amber-400">
								{adminCount}
							</div>
						</div>

						<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md space-y-1">
							<div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-secondary)]">
								<span>Verified Accounts</span>
								<UserCheck className="w-4 h-4 text-emerald-400" />
							</div>
							<div className="text-2xl sm:text-3xl font-black text-emerald-400">
								{verifiedCount}
							</div>
						</div>
					</div>

					{/* Search & Filter Bar */}
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search users by username, email, or display name..."
							className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] transition-all shadow-inner"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-white"
							>
								Clear
							</button>
						)}
					</div>

					{/* User Table Card */}
					<div className="rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl overflow-hidden">
						{error ? (
							<div className="p-12 text-center space-y-3">
								<AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
								<p className="text-sm font-semibold text-rose-400">{error}</p>
								<button
									type="button"
									onClick={() => fetchUsers(searchQuery)}
									className="px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold"
								>
									Try Again
								</button>
							</div>
						) : isLoading ? (
							<div className="p-16 flex flex-col items-center justify-center space-y-3">
								<Loader2 className="w-8 h-8 animate-spin text-[var(--color-interactive-primary)]" />
								<p className="text-xs font-semibold text-[var(--color-text-secondary)]">
									Loading user database...
								</p>
							</div>
						) : users.length === 0 ? (
							<div className="p-16 text-center space-y-2">
								<Users className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto opacity-50" />
								<p className="text-sm font-bold text-[var(--color-text-primary)]">
									No users found
								</p>
								<p className="text-xs text-[var(--color-text-secondary)]">
									No accounts match &ldquo;{searchQuery}&rdquo;.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs">
									<thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold border-b border-[var(--color-border-subtle)]">
										<tr>
											<th className="px-6 py-4">User</th>
											<th className="px-6 py-4">Email</th>
											<th className="px-6 py-4">Role / Staff</th>
											<th className="px-6 py-4">Verification</th>
											<th className="px-6 py-4">Joined Date</th>
											<th className="px-6 py-4 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[var(--color-border-subtle)]">
										{users.map((u) => {
											const isUserAdmin =
												u.username.toLowerCase() === "afgan" ||
												u.role === "admin" ||
												u.is_staff;
											const isSelf = u.id === currentAdmin.id;
											const avatarUrl = resolveStorageUrl(u.avatar_url);

											return (
												<tr
													key={u.id}
													className="hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
												>
													{/* User info */}
													<td className="px-6 py-4">
														<div className="flex items-center gap-3">
															<Link
																href={`/u/${u.username}`}
																className="w-9 h-9 rounded-full overflow-hidden bg-[var(--color-bg-elevated)] shrink-0 border border-white/10 hover:opacity-80 transition-opacity"
															>
																{avatarUrl ? (
																	<img
																		src={avatarUrl}
																		alt={u.display_name}
																		className="w-full h-full object-cover"
																	/>
																) : (
																	<div className="w-full h-full flex items-center justify-center font-bold text-white bg-purple-900/60">
																		{u.display_name[0]?.toUpperCase() || "U"}
																	</div>
																)}
															</Link>
															<div>
																<div className="font-bold text-[var(--color-text-primary)] text-sm flex items-center gap-1.5">
																	<Link
																		href={`/u/${u.username}`}
																		className="hover:underline hover:text-[var(--color-interactive-primary)]"
																	>
																		{u.display_name}
																	</Link>
																	{u.is_verified && (
																		<span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[8px] font-black shrink-0">
																			✓
																		</span>
																	)}
																</div>
																<Link
																	href={`/u/${u.username}`}
																	className="text-[var(--color-text-secondary)] font-mono text-[11px] hover:underline"
																>
																	@{u.username}
																</Link>
															</div>
														</div>
													</td>

													{/* Email */}
													<td className="px-6 py-4 text-[var(--color-text-secondary)]">
														<div className="flex items-center gap-1.5 font-mono">
															<Mail className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
															<span>{u.email || "No email"}</span>
														</div>
													</td>

													{/* Role */}
													<td className="px-6 py-4">
														{isUserAdmin ? (
															<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
																<ShieldCheck className="w-3 h-3" /> Admin
															</span>
														) : (
															<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-white/5 text-[var(--color-text-secondary)] border border-white/10">
																User
															</span>
														)}
													</td>

													{/* Verification Status */}
													<td className="px-6 py-4">
														{u.is_verified ? (
															<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
																<UserCheck className="w-3 h-3" /> Verified ✓
															</span>
														) : (
															<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-white/5 text-[var(--color-text-tertiary)] border border-white/5">
																Unverified
															</span>
														)}
													</td>

													{/* Joined Date */}
													<td className="px-6 py-4 text-[var(--color-text-secondary)]">
														<div className="flex items-center gap-1.5">
															<Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
															<span>
																{new Date(u.created_at).toLocaleDateString(
																	undefined,
																	{
																		year: "numeric",
																		month: "short",
																		day: "numeric",
																	},
																)}
															</span>
														</div>
													</td>

													{/* Actions */}
													<td className="px-6 py-4 text-right">
														<div className="flex items-center justify-end gap-2">
															{/* Admin Role Action */}
															{!isSelf &&
																u.username.toLowerCase() !== "afgan" &&
																(isUserAdmin ? (
																	<button
																		type="button"
																		onClick={() =>
																			setRoleTarget({
																				user: u,
																				targetRole: "user",
																			})
																		}
																		className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 text-[11px] font-semibold transition-all active:scale-95"
																		title="Cabut hak akses admin"
																	>
																		<ShieldX className="w-3 h-3 text-purple-400" />
																		<span>Cabut Admin</span>
																	</button>
																) : (
																	<button
																		type="button"
																		onClick={() =>
																			setRoleTarget({
																				user: u,
																				targetRole: "admin",
																			})
																		}
																		className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[11px] font-semibold transition-all active:scale-95"
																		title="Jadikan pengguna sebagai Admin"
																	>
																		<ShieldCheck className="w-3 h-3" />
																		<span>Jadikan Admin</span>
																	</button>
																))}

															{/* Verification Action */}
															{u.is_verified ? (
																<button
																	type="button"
																	onClick={() =>
																		setVerifyTarget({
																			user: u,
																			targetStatus: false,
																		})
																	}
																	className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[11px] font-semibold transition-all active:scale-95"
																>
																	<UserX className="w-3 h-3" />
																	<span>Remove</span>
																</button>
															) : (
																<button
																	type="button"
																	onClick={() =>
																		setVerifyTarget({
																			user: u,
																			targetStatus: true,
																		})
																	}
																	className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px] font-semibold transition-all active:scale-95"
																>
																	<UserCheck className="w-3 h-3" />
																	<span>Verify</span>
																</button>
															)}

															{/* Delete Action */}
															{isSelf ? (
																<span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] italic px-1">
																	Self
																</span>
															) : isUserAdmin ? (
																<span className="text-[10px] font-semibold text-amber-500/60 italic px-1">
																	Protected
																</span>
															) : (
																<button
																	type="button"
																	onClick={() => setTargetUser(u)}
																	className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-[11px] font-semibold active:scale-95"
																>
																	<Trash2 className="w-3 h-3" />
																	<span>Delete</span>
																</button>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Tab 2: Creator Permissions & Outreach Pipeline */}
			{activeTab === "creator_permissions" && (
				<div className="animate-in fade-in duration-200">
					<CreatorPermissionsTab />
				</div>
			)}

			{/* Tab 3: Reports & Content Moderation */}
			{activeTab === "reports" && (
				<div className="animate-in fade-in duration-200">
					<ReportsModerationTab />
				</div>
			)}

			{/* Tab 4: Creator Payouts & Withdrawals */}
			{activeTab === "withdrawals" && (
				<div className="animate-in fade-in duration-200">
					<WithdrawalsAdminTab />
				</div>
			)}

			{/* Role Promotion/Demotion Confirmation Modal */}
			{roleTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
					<div className="w-full max-w-md rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4 text-left">
						<div className="flex items-center gap-3">
							<div
								className={`p-3 rounded-2xl border shrink-0 ${
									roleTarget.targetRole === "admin"
										? "bg-amber-500/10 border-amber-500/20 text-amber-400"
										: "bg-purple-500/10 border-purple-500/20 text-purple-400"
								}`}
							>
								{roleTarget.targetRole === "admin" ? (
									<ShieldCheck className="w-6 h-6" />
								) : (
									<ShieldX className="w-6 h-6" />
								)}
							</div>
							<div>
								<h3 className="text-lg font-extrabold text-[var(--color-text-primary)]">
									{roleTarget.targetRole === "admin"
										? `Jadikan @${roleTarget.user.username} Admin?`
										: `Cabut Admin @${roleTarget.user.username}?`}
								</h3>
								<p className="text-xs text-[var(--color-text-secondary)]">
									{roleTarget.targetRole === "admin"
										? "User ini akan mendapatkan akses penuh ke Admin Control Center."
										: "Hak akses admin user ini akan dicabut kembali menjadi user biasa."}
								</p>
							</div>
						</div>

						{roleError && (
							<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
								{roleError}
							</div>
						)}

						<div className="flex items-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setRoleTarget(null)}
								disabled={isUpdatingRole}
								className="flex-1 min-h-[44px] rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-50"
							>
								Batal
							</button>

							<button
								type="button"
								onClick={handleRoleConfirm}
								disabled={isUpdatingRole}
								className={`flex-1 min-h-[44px] rounded-2xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
									roleTarget.targetRole === "admin"
										? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
										: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30"
								}`}
							>
								{isUpdatingRole ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Menyimpan...</span>
									</>
								) : (
									<>
										{roleTarget.targetRole === "admin" ? (
											<ShieldCheck className="w-4 h-4" />
										) : (
											<ShieldX className="w-4 h-4" />
										)}
										<span>
											{roleTarget.targetRole === "admin"
												? "Konfirmasi Jadikan Admin"
												: "Konfirmasi Cabut Admin"}
										</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Verification Confirmation Modal */}
			{verifyTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
					<div className="w-full max-w-md rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4 text-left">
						<div className="flex items-center gap-3 text-emerald-400">
							<div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
								{verifyTarget.targetStatus ? (
									<UserCheck className="w-6 h-6 text-emerald-400" />
								) : (
									<UserX className="w-6 h-6 text-amber-400" />
								)}
							</div>
							<div>
								<h3 className="text-lg font-extrabold text-[var(--color-text-primary)]">
									{verifyTarget.targetStatus
										? `Verify @${verifyTarget.user.username}?`
										: `Remove verification from @${verifyTarget.user.username}?`}
								</h3>
								<p className="text-xs text-[var(--color-text-secondary)]">
									{verifyTarget.targetStatus
										? "Give this account the official verified badge?"
										: "Remove official verified badge from this account?"}
								</p>
							</div>
						</div>

						{verifyError && (
							<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
								{verifyError}
							</div>
						)}

						<div className="flex items-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setVerifyTarget(null)}
								disabled={isVerifying}
								className="flex-1 min-h-[44px] rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-50"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleVerifyConfirm}
								disabled={isVerifying}
								className={`flex-1 min-h-[44px] rounded-2xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
									verifyTarget.targetStatus
										? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
										: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
								}`}
							>
								{isVerifying ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Updating...</span>
									</>
								) : (
									<>
										<UserCheck className="w-4 h-4" />
										<span>
											{verifyTarget.targetStatus
												? "Confirm Verification"
												: "Confirm Removal"}
										</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Permanent Confirmation Modal */}
			{targetUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
					<div className="w-full max-w-md rounded-3xl bg-[var(--color-bg-surface)] border border-rose-500/30 p-6 shadow-2xl space-y-4 text-left">
						<div className="flex items-center gap-3 text-rose-400">
							<div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shrink-0">
								<AlertTriangle className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-lg font-extrabold text-[var(--color-text-primary)]">
									Delete @{targetUser.username} permanently?
								</h3>
								<p className="text-xs text-[var(--color-text-secondary)]">
									This action is permanent and irreversible.
								</p>
							</div>
						</div>

						<div className="p-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-2 text-xs text-[var(--color-text-secondary)]">
							<p className="font-semibold text-rose-400">
								The following data will be permanently removed:
							</p>
							<ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
								<li>Supabase Auth user credentials</li>
								<li>User profile & account settings</li>
								<li>All published presets & XML/video media files</li>
								<li>Uploaded avatar & storage files</li>
								<li>Likes, bookmarks, comments & notifications</li>
							</ul>
						</div>

						{deleteError && (
							<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
								{deleteError}
							</div>
						)}

						<div className="flex items-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setTargetUser(null)}
								disabled={isDeleting}
								className="flex-1 min-h-[44px] rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-50"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleDeleteConfirm}
								disabled={isDeleting}
								className="flex-1 min-h-[44px] rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
							>
								{isDeleting ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Deleting Account...</span>
									</>
								) : (
									<>
										<Trash2 className="w-4 h-4" />
										<span>Delete Permanently</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
