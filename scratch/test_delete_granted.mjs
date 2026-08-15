import fs from 'fs';
import path from 'path';

const envPath = path.resolve('apps/web/.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function testDeletePrivileges() {
  console.log("\n--- DIAGNOSTIC: Testing DELETE privileges on public.users for service_role ---");
  const fakeId = "00000000-0000-0000-0000-000000000000";
  const res = await fetch(`${url}/rest/v1/users?id=eq.${fakeId}`, {
    method: 'DELETE',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation'
    }
  });
  console.log("Status:", res.status, res.statusText);
  const body = await res.text();
  console.log("Response Body:", body);
}

testDeletePrivileges();
