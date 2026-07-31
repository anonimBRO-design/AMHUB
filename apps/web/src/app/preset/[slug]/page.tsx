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
			title: "Preset Not Found | PresetHub",
		};
	}

	return {
		title: `${preset.title} by ${preset.creator.display_name} | PresetHub`,
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

	const rawRelated = await listPublishedPresets(supabase, {
		category: rawPreset.category,
		limit: 6,
	});

	const cardPreset = mapPresetToCardPreset(rawPreset);
	const presetForDetail = {
		...cardPreset,
		fileType: "flstudio" as const, // PresetDetail prop interface mapping
	};

	const relatedPresets = rawRelated
		.filter((p) => p.id !== rawPreset.id)
		.map(mapPresetToCardPreset);

	return (
		<PresetDetailClient
			preset={presetForDetail}
			relatedPresets={relatedPresets}
		/>
	);
}
