import { listComments } from "@/dal/comments.dal";
import { getPresetBySlug, listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PresetDetailClient } from "./_components/preset-detail-client";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const supabase = await createSupabaseServerClient();
	const preset = await getPresetBySlug(supabase, slug);

	if (!preset) {
		return {
			title: "Preset Not Found | AMHUB",
		};
	}

	return {
		title: `${preset.title} by ${preset.creator.display_name} | AMHUB`,
		description:
			preset.description ??
			`Download ${preset.title} Alight Motion preset by ${preset.creator.display_name}.`,
	};
}

export default async function PresetDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const supabase = await createSupabaseServerClient();

	const rawPreset = await getPresetBySlug(supabase, slug);
	if (!rawPreset) {
		notFound();
	}

	const [rawRelated, commentsRes] = await Promise.all([
		listPublishedPresets(supabase, {
			category: rawPreset.category,
			limit: 9,
		}),
		listComments(supabase, rawPreset.id, { page: 1, limit: 25 }),
	]);

	const cardPreset = mapPresetToCardPreset(rawPreset);
	const presetForDetail = {
		...cardPreset,
		fileType: rawPreset.file_type,
		fileUrl: rawPreset.file_url,
		amLink: rawPreset.am_link,
	};

	const relatedPresets = rawRelated
		.filter((p) => p.id !== rawPreset.id)
		.slice(0, 8)
		.map(mapPresetToCardPreset);

	const initialComments = (commentsRes.items ?? []).map((c) => {
		const item = c as unknown as {
			id: string;
			body?: string;
			content?: string;
			created_at?: string;
			createdAt?: string;
			user?: {
				username?: string;
				display_name?: string;
				displayName?: string;
				avatar_url?: string;
				avatarUrl?: string;
			};
		};
		return {
			id: item.id,
			content: item.body || item.content || "",
			createdAt: item.created_at || item.createdAt || new Date().toISOString(),
			user: {
				username: item.user?.username || "user",
				displayName:
					item.user?.display_name || item.user?.displayName || "User",
				avatarUrl: item.user?.avatar_url || item.user?.avatarUrl || null,
			},
		};
	});

	return (
		<PresetDetailClient
			preset={presetForDetail}
			relatedPresets={relatedPresets}
			comments={initialComments}
		/>
	);
}
