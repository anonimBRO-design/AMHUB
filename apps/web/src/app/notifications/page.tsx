import { listNotifications } from "@/data/notifications";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import {
	NotificationList,
	type NotificationListItem,
} from "./_components/notification-list";

export const metadata: Metadata = {
	title: "Notifications | PresetHub",
	description: "View your account notifications and activity updates.",
};

export default async function NotificationsPage() {
	const user = await requireUser();
	const supabase = await createSupabaseServerClient();

	const rawNotifications = await listNotifications(supabase, user.id);

	const initialNotifications: NotificationListItem[] = (
		rawNotifications as unknown as Array<{
			id: string;
			type: string;
			message: string | null;
			is_read: boolean;
			created_at: string;
		}>
	).map((n) => ({
		id: n.id,
		type: n.type as NotificationListItem["type"],
		message: n.message ?? undefined,
		isRead: n.is_read,
		createdAt: new Date(n.created_at).toLocaleDateString(),
	}));

	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold">Notifications</h1>
			<NotificationList initialNotifications={initialNotifications} />
		</div>
	);
}
