import { getPresetBySlug } from "@/data/presets";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Alight Motion Preset on AMHUB";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const supabase = await createSupabaseServerClient();
	const preset = await getPresetBySlug(supabase, slug);

	const title = preset?.title || "Alight Motion Preset";
	const category = preset?.category || "XML Preset";
	const creatorName = preset?.creator?.display_name || "AMHUB Creator";
	const creatorUsername = preset?.creator?.username || "creator";
	const downloads = preset?.download_count || 0;
	const likes = preset?.like_count || 0;
	const fileType = (preset?.file_type || "XML").toUpperCase();

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#090A0F",
				backgroundImage:
					"radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 200, 255, 0.15) 0%, transparent 50%)",
				padding: "60px",
				fontFamily: "sans-serif",
				color: "#FFFFFF",
			}}
		>
			{/* Top Header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<div
						style={{
							backgroundColor: "#10B981",
							color: "#000000",
							padding: "8px 18px",
							borderRadius: "16px",
							fontWeight: 900,
							fontSize: "20px",
							letterSpacing: "1px",
						}}
					>
						AMHUB
					</div>
					<span
						style={{
							color: "#94A3B8",
							fontSize: "20px",
							fontWeight: 600,
						}}
					>
						Alight Motion Preset Hub
					</span>
				</div>

				<div style={{ display: "flex", gap: "12px" }}>
					<div
						style={{
							backgroundColor: "rgba(16, 185, 129, 0.15)",
							border: "1px solid rgba(16, 185, 129, 0.3)",
							color: "#34D399",
							padding: "6px 16px",
							borderRadius: "999px",
							fontSize: "16px",
							fontWeight: 700,
						}}
					>
						{fileType}
					</div>
					<div
						style={{
							backgroundColor: "rgba(0, 200, 255, 0.2)",
							border: "1px solid rgba(0, 200, 255, 0.4)",
							color: "#00E5FF",
							padding: "6px 16px",
							borderRadius: "999px",
							fontSize: "16px",
							fontWeight: 700,
							textTransform: "capitalize",
						}}
					>
						{category}
					</div>
				</div>
			</div>

			{/* Main Center Title */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "16px",
					maxWidth: "950px",
				}}
			>
				<h1
					style={{
						fontSize: "56px",
						fontWeight: 900,
						lineHeight: 1.15,
						margin: 0,
						letterSpacing: "-1px",
						color: "#FFFFFF",
					}}
				>
					{title}
				</h1>
				<p
					style={{
						fontSize: "22px",
						color: "#94A3B8",
						margin: 0,
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					⚡ 1-Tap Direct Import to Alight Motion
				</p>
			</div>

			{/* Bottom Bar: Creator Info & Stats */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderTop: "1px solid rgba(255, 255, 255, 0.1)",
					paddingTop: "28px",
					width: "100%",
				}}
			>
				{/* Creator */}
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<div
						style={{
							width: "56px",
							height: "56px",
							borderRadius: "999px",
							backgroundColor: "#00B8E6",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "22px",
							fontWeight: 800,
							color: "#FFFFFF",
						}}
					>
						{creatorName.slice(0, 2).toUpperCase()}
					</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<span
							style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC" }}
						>
							{creatorName}
						</span>
						<span style={{ fontSize: "16px", color: "#64748B" }}>
							@{creatorUsername}
						</span>
					</div>
				</div>

				{/* Stats */}
				<div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							fontSize: "18px",
							color: "#F43F5E",
							fontWeight: 700,
						}}
					>
						❤️ <span>{likes} Likes</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							fontSize: "18px",
							color: "#10B981",
							fontWeight: 700,
						}}
					>
						📥 <span>{downloads} Downloads</span>
					</div>
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
