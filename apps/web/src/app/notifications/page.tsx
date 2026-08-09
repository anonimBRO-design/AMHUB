import { listNotifications } from "@/dal/notifications.dal";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { NotificationItemData } from "./_components/NotificationCard";
import { NotificationClient } from "./_components/NotificationClient";

export const metadata: Metadata = {
	title: "Notifications | AMHUB",
	description: "View your account notifications and activity updates.",
};

export default async function NotificationsPage() {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/auth/login");
	}

	const supabase = await createSupabaseServerClient();
	const rawNotifications = await listNotifications(supabase, profile.id);

	const initialNotifications: NotificationItemData[] = (
		rawNotifications as unknown as Array<{
			id: string;
			type: string;
			message: string | null;
			is_read: boolean;
			created_at: string;
			actor?: { username: string; display_name: string; avatar_url?: string };
			preset?: { slug: string; title: string; thumbnail_url?: string };
		}>
	).map((n) => ({
		id: n.id,
		type: n.type as NotificationItemData["type"],
		actor: n.actor
			? {
					username: n.actor.username,
					displayName: n.actor.display_name,
					avatarUrl: resolveStorageUrl(n.actor.avatar_url),
				}
			: undefined,
		preset: n.preset
			? {
					slug: n.preset.slug,
					title: n.preset.title,
					thumbnailUrl: n.preset.thumbnail_url,
				}
			: undefined,
		message: n.message ?? undefined,
		isRead: n.is_read,
		rawCreatedAt: n.created_at,
		createdAt: new Date(n.created_at).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}),
	}));

	return <NotificationClient initialNotifications={initialNotifications} />;
}
