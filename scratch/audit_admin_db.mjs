import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve("apps/web/.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", url);
console.log("Service Key Present:", Boolean(serviceKey));

const serviceClient = createClient(url, serviceKey);
const anonClient = createClient(url, anonKey);

async function runDiagnostics() {
	console.log("\n--- TEST 1: Service Role Client select('id') ---");
	const serviceRes = await serviceClient
		.from("users")
		.select("id", { count: "exact" });
	console.log("Service Role Status:", serviceRes.status, serviceRes.statusText);
	console.log("Service Role Error:", serviceRes.error);
	console.log("Service Role Count:", serviceRes.count);
	console.log("Service Role Data Length:", serviceRes.data?.length);

	console.log("\n--- TEST 2: Service Role Client select('*') ---");
	const serviceStarRes = await serviceClient
		.from("users")
		.select("*", { count: "exact" });
	console.log("Service Role select('*') Error:", serviceStarRes.error);
	console.log("Service Role select('*') Count:", serviceStarRes.count);

	console.log("\n--- TEST 3: Anon Client select('id') ---");
	const anonRes = await anonClient
		.from("users")
		.select("id", { count: "exact" });
	console.log("Anon Role Status:", anonRes.status, anonRes.error);

	console.log(
		"\n--- TEST 4: Anon Client select('id, username, display_name, avatar_url, is_verified') ---",
	);
	const anonHomeRes = await anonClient
		.from("users")
		.select("id, username, display_name, avatar_url, is_verified");
	console.log("Anon Home Query Error:", anonHomeRes.error);
	console.log("Anon Home Query Data Length:", anonHomeRes.data?.length);

	console.log("\n--- TEST 5: Table Privileges & RLS RPC/Query ---");
	try {
		const { data: grants, error: grantsErr } = await serviceClient.rpc(
			"exec_sql",
			{
				sql: `SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'users';`,
			},
		);
		console.log("Grants via RPC:", grants, grantsErr);
	} catch (e) {
		console.log("RPC exec_sql not available");
	}
}

runDiagnostics();
