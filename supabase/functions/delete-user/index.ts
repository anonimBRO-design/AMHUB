import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const authHeader = req.headers.get("Authorization");
		if (!authHeader) {
			return new Response(
				JSON.stringify({ error: "Missing authorization header" }),
				{
					status: 401,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
		const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
		const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

		// 1. Verify caller identity using their JWT
		const clientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
			global: { headers: { Authorization: authHeader } },
		});

		const {
			data: { user: callerUser },
			error: userErr,
		} = await clientSupabase.auth.getUser();

		if (userErr || !callerUser) {
			return new Response(JSON.stringify({ error: "Unauthorized caller" }), {
				status: 401,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// 2. Instantiate Service-Role client for admin checks and deletion
		const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

		// Fetch caller's profile to verify admin role
		const { data: callerProfile } = await serviceSupabase
			.from("users")
			.select("id, username, role, is_staff")
			.eq("id", callerUser.id)
			.maybeSingle();

		const isAdmin =
			callerProfile?.username?.toLowerCase() === "afgan" ||
			callerProfile?.role === "admin" ||
			callerProfile?.is_staff === true ||
			callerUser.app_metadata?.role === "admin";

		if (!isAdmin) {
			return new Response(JSON.stringify({ error: "Admin access required" }), {
				status: 403,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const { userId: targetUserId } = await req.json();
		if (!targetUserId) {
			return new Response(JSON.stringify({ error: "Missing userId" }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// Prevent self-deletion
		if (targetUserId === callerUser.id) {
			return new Response(
				JSON.stringify({ error: "Cannot delete your own admin account" }),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		// Check target user role
		const { data: targetUser } = await serviceSupabase
			.from("users")
			.select("id, username, role")
			.eq("id", targetUserId)
			.maybeSingle();

		if (
			targetUser?.username?.toLowerCase() === "afgan" ||
			targetUser?.role === "admin"
		) {
			return new Response(
				JSON.stringify({ error: "Cannot delete an admin user" }),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		// 3. Perform Storage & DB Cleanup
		const buckets = ["avatars", "thumbnails", "preset-files", "preset-videos"];
		for (const bucket of buckets) {
			const { data: files } = await serviceSupabase.storage
				.from(bucket)
				.list(targetUserId);
			if (files && files.length > 0) {
				const paths = files.map((f) => `${targetUserId}/${f.name}`);
				await serviceSupabase.storage.from(bucket).remove(paths);
			}
		}

		await serviceSupabase
			.from("notifications")
			.delete()
			.or(`user_id.eq.${targetUserId},actor_id.eq.${targetUserId}`);
		await serviceSupabase
			.from("preset_likes")
			.delete()
			.eq("user_id", targetUserId);
		await serviceSupabase
			.from("preset_bookmarks")
			.delete()
			.eq("user_id", targetUserId);
		await serviceSupabase
			.from("follows")
			.delete()
			.or(`follower_id.eq.${targetUserId},following_id.eq.${targetUserId}`);
		await serviceSupabase.from("comments").delete().eq("user_id", targetUserId);

		const { data: userPresets } = await serviceSupabase
			.from("presets")
			.select("id")
			.eq("creator_id", targetUserId);

		if (userPresets) {
			for (const p of userPresets) {
				await serviceSupabase
					.from("preset_tags")
					.delete()
					.eq("preset_id", p.id);
				await serviceSupabase
					.from("preset_likes")
					.delete()
					.eq("preset_id", p.id);
				await serviceSupabase
					.from("preset_bookmarks")
					.delete()
					.eq("preset_id", p.id);
				await serviceSupabase
					.from("collection_items")
					.delete()
					.eq("preset_id", p.id);
				await serviceSupabase.from("comments").delete().eq("preset_id", p.id);
				await serviceSupabase
					.from("notifications")
					.delete()
					.eq("preset_id", p.id);
			}
			await serviceSupabase
				.from("presets")
				.delete()
				.eq("creator_id", targetUserId);
		}

		await serviceSupabase.from("users").delete().eq("id", targetUserId);
		await serviceSupabase.auth.admin.deleteUser(targetUserId);

		return new Response(
			JSON.stringify({ success: true, message: "User deleted successfully" }),
			{ headers: { ...corsHeaders, "Content-Type": "application/json" } },
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Internal error";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});
