import { getRequestById, listOffers } from "@/dal/requests.dal";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestDetailClient } from "./_components/RequestDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RequestDetailPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: RequestDetailPageProps): Promise<Metadata> {
	const { id } = await params;
	try {
		const supabase = await createSupabaseServerClient();
		const request = await getRequestById(supabase, id);
		return {
			title: `${request.title} | Request Custom AMHUB`,
			description: request.description.slice(0, 160),
		};
	} catch {
		return { title: "Request | AMHUB" };
	}
}

export default async function RequestDetailPage({
	params,
}: RequestDetailPageProps) {
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const currentUser = await getCurrentUser();

	let request: Awaited<ReturnType<typeof getRequestById>>;
	try {
		request = await getRequestById(supabase, id);
	} catch {
		notFound();
	}

	const offers = currentUser
		? await listOffers(supabase, id).catch(() => [])
		: [];

	const r = request as unknown as {
		id: string;
		requester_id: string;
		title: string;
		description: string;
		budget_min: number;
		budget_max: number;
		status: string;
		created_at: string;
		requester: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
		};
	};

	return (
		<RequestDetailClient
			request={r}
			initialOffers={offers.map((o) => ({
				id: o.id,
				price: o.price,
				message: o.message,
				etaDays: o.eta_days,
				status: o.status,
				creatorId: o.creator_id,
				creatorUsername: o.creator.username,
				creatorDisplayName: o.creator.display_name,
			}))}
			isOwner={Boolean(currentUser && currentUser.id === r.requester_id)}
			currentUserId={currentUser?.id ?? null}
			isLoggedIn={Boolean(currentUser)}
		/>
	);
}
