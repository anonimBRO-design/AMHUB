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

const tables = [
	"users",
	"notifications",
	"preset_likes",
	"preset_bookmarks",
	"follows",
	"comments",
	"presets",
	"preset_tags",
	"collection_items",
	"collections",
];

async function testAllTables() {
	const fakeId = "00000000-0000-0000-0000-000000000000";
	console.log("--- TESTING SERVICE ROLE DELETE PERMISSIONS ON ALL TABLES ---");
	for (const table of tables) {
		const res = await fetch(`${url}/rest/v1/${table}?id=eq.${fakeId}`, {
			method: "DELETE",
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
				Prefer: "return=representation",
			},
		});
		const body = await res.text();
		console.log(
			`Table '${table}': Status ${res.status} ${res.statusText} -> ${body}`,
		);
	}
}

testAllTables();
