const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export function resolveStorageUrl(
	path: string | null | undefined,
	bucket: "avatars" | "thumbnails" | "preset-files" | "preset-videos" = "avatars",
): string | null {
	if (!path) return null;
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	const base = SUPABASE_URL.replace(/\/+$/, "");
	if (!base) return null;
	return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
