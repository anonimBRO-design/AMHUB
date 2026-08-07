import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createSupabaseServerClient();

		const { data: preset } = await supabase
			.from("presets")
			.select("download_count")
			.eq("id", id)
			.maybeSingle();

		if (preset) {
			const current =
				(preset as unknown as { download_count?: number }).download_count ?? 0;
			await supabase
				.from("presets")
				.update({ download_count: current + 1 } as never)
				.eq("id", id);
		}

		return NextResponse.json({ success: true, preset_id: id });
	} catch (e: unknown) {
		return NextResponse.json(
			{
				error: {
					message: e instanceof Error ? e.message : "Failed to record download",
				},
			},
			{ status: 500 },
		);
	}
}
