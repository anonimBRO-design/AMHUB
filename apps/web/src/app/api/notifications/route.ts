import {
	getUnreadNotificationCount,
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from "@/dal/notifications.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const { supabase, profile } = await requireApiProfile();
		const [notifications, unreadCount] = await Promise.all([
			listNotifications(supabase, profile.id, 50),
			getUnreadNotificationCount(supabase, profile.id),
		]);

		return apiResponse({ notifications, unreadCount });
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const body = await request.json();

		if (body.markAll) {
			await markAllNotificationsRead(supabase, profile.id);
			return apiResponse({ success: true, markedAll: true });
		}

		if (body.id) {
			await markNotificationRead(supabase, body.id, profile.id);
			return apiResponse({ success: true, id: body.id });
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error) {
		return apiErrorResponse(error);
	}
}
