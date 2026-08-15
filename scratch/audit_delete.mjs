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
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function testDeletePermissions() {
  console.log("\n--- TEST 1: Service Role DELETE dry-run on non-existent UUID ---");
  const fakeId = "00000000-0000-0000-0000-000000000000";
  const resService = await fetch(`${url}/rest/v1/users?id=eq.${fakeId}`, {
    method: 'DELETE',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation'
    }
  });
  console.log("Service DELETE Status:", resService.status, resService.statusText);
  const textService = await resService.text();
  console.log("Service DELETE Response Body:", textService);

  console.log("\n--- TEST 2: Anon DELETE dry-run on non-existent UUID ---");
  const resAnon = await fetch(`${url}/rest/v1/users?id=eq.${fakeId}`, {
    method: 'DELETE',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Prefer': 'return=representation'
    }
  });
  console.log("Anon DELETE Status:", resAnon.status, resAnon.statusText);
  const textAnon = await resAnon.text();
  console.log("Anon DELETE Response Body:", textAnon);
}

testDeletePermissions();
