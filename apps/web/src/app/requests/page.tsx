import { listRequests } from "@/dal/requests.dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { RequestsClient } from "./_components/RequestsClient";

export const metadata: Metadata = {
	title: "Request Custom Preset | AMHUB",
	description:
		"Posting brief preset impianmu dengan budget, dan biarkan kreator AMHUB bidding mengerjakannya.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RequestsPage() {
	const supabase = await createSupabaseServerClient();
	const requests = await listRequests(supabase, { status: "open", limit: 30 });

	return <RequestsClient initialRequests={requests} />;
}
