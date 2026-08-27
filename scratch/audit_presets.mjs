import fs from "fs";
import path from "path";

const envPath = path.resolve("apps/web/.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};

envContent.split(/\r?\n/).forEach((line) => {
	const match = line.match(/^([^=]+)=(.*)$/);
	if (match) {
		env[match[1].trim()] = match[2].trim();
	}
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", url);

async function checkPresets() {
	console.log("\n--- 1. Check presets columns using Service Key ---");
	const res = await fetch(`${url}/rest/v1/presets?select=*&limit=5`, {
		headers: {
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
		},
	});
	console.log("Presets SELECT * status:", res.status, res.statusText);
	const presetsData = await res.json();
	console.log("Presets count:", presetsData?.length);
	if (presetsData?.length > 0) {
		console.log("Sample preset keys:", Object.keys(presetsData[0]));
		console.log("Sample preset:", presetsData[0]);
	} else {
		console.log("Presets response:", presetsData);
	}

	console.log("\n--- 2. Test PRESET_SELECT_WITH_CREATOR via Service Key ---");
	const selectQuery = `id,slug,title,description,thumbnail_url,preview_video_url,file_type,file_url,am_link,category,difficulty,tags,status,download_count,unique_download_count,price,is_paid,currency,view_count,like_count,bookmark_count,comment_count,is_featured,created_at,creator:users!presets_creator_id_fkey(id,username,display_name,avatar_url,is_verified)`;

	const resSelect = await fetch(
		`${url}/rest/v1/presets?select=${encodeURIComponent(selectQuery)}&limit=5`,
		{
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
			},
		},
	);
	console.log(
		"PRESET_SELECT_WITH_CREATOR status:",
		resSelect.status,
		resSelect.statusText,
	);
	const selectResult = await resSelect.json();
	console.log("Result:", selectResult);

	console.log(
		"\n--- 3. Test Anon Key SELECT with PRESET_SELECT_WITH_CREATOR ---",
	);
	const resAnon = await fetch(
		`${url}/rest/v1/presets?select=${encodeURIComponent(selectQuery)}&status=eq.published&limit=5`,
		{
			headers: {
				apikey: anonKey,
				Authorization: `Bearer ${anonKey}`,
			},
		},
	);
	console.log("Anon SELECT status:", resAnon.status, resAnon.statusText);
	const anonResult = await resAnon.json();
	console.log("Anon Result:", anonResult);
}

checkPresets().catch(console.error);
