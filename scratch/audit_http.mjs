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
console.log("Anon Key Present:", Boolean(anonKey));
console.log("Service Key Present:", Boolean(serviceKey));

async function testFetch() {
	console.log(
		"\n--- TEST 1: Service Role Key GET /rest/v1/users?select=id ---",
	);
	const resService = await fetch(`${url}/rest/v1/users?select=id`, {
		headers: {
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			Prefer: "count=exact",
		},
	});
	console.log("Service Status:", resService.status, resService.statusText);
	const textService = await resService.text();
	console.log("Service Response Body:", textService);
	console.log(
		"Service Content-Range:",
		resService.headers.get("content-range"),
	);

	console.log("\n--- TEST 2: Service Role Key GET /rest/v1/users?select=* ---");
	const resServiceStar = await fetch(`${url}/rest/v1/users?select=*`, {
		headers: {
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			Prefer: "count=exact",
		},
	});
	console.log(
		"Service Select Star Status:",
		resServiceStar.status,
		resServiceStar.statusText,
	);
	const textServiceStar = await resServiceStar.text();
	console.log("Service Select Star Body:", textServiceStar);

	console.log(
		"\n--- TEST 3: Anon Key GET /rest/v1/users?select=id,username,display_name,avatar_url,is_verified ---",
	);
	const resAnon = await fetch(
		`${url}/rest/v1/users?select=id,username,display_name,avatar_url,is_verified`,
		{
			headers: {
				apikey: anonKey,
				Authorization: `Bearer ${anonKey}`,
				Prefer: "count=exact",
			},
		},
	);
	console.log("Anon Home Query Status:", resAnon.status, resAnon.statusText);
	const textAnon = await resAnon.text();
	console.log("Anon Home Query Body:", textAnon);
	console.log("Anon Content-Range:", resAnon.headers.get("content-range"));

	console.log("\n--- TEST 4: Anon Key GET /rest/v1/users?select=* ---");
	const resAnonStar = await fetch(`${url}/rest/v1/users?select=*`, {
		headers: {
			apikey: anonKey,
			Authorization: `Bearer ${anonKey}`,
		},
	});
	console.log(
		"Anon Select Star Status:",
		resAnonStar.status,
		resAnonStar.statusText,
	);
	const textAnonStar = await resAnonStar.text();
	console.log("Anon Select Star Body:", textAnonStar);
}

testFetch();
