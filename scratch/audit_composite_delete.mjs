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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const fakeId = "00000000-0000-0000-0000-000000000000";

async function testComposite() {
	const queries = [
		{ table: "preset_likes", param: `user_id=eq.${fakeId}` },
		{ table: "preset_bookmarks", param: `user_id=eq.${fakeId}` },
		{ table: "follows", param: `follower_id=eq.${fakeId}` },
		{ table: "preset_tags", param: `preset_id=eq.${fakeId}` },
		{ table: "collection_items", param: `preset_id=eq.${fakeId}` },
	];

	for (const q of queries) {
		const res = await fetch(`${url}/rest/v1/${q.table}?${q.param}`, {
			method: "DELETE",
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
				Prefer: "return=representation",
			},
		});
		const body = await res.text();
		console.log(
			`Table '${q.table}': Status ${res.status} ${res.statusText} -> ${body}`,
		);
	}
}

testComposite();
