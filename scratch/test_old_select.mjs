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

async function checkOldSelect() {
  const oldSelect = `id,slug,title,description,thumbnail_url,preview_video_url,file_type,file_url,am_link,category,difficulty,tags,status,download_count,view_count,like_count,bookmark_count,comment_count,is_featured,created_at,creator:users!presets_creator_id_fkey(id,username,display_name,avatar_url,is_verified)`;
  
  const resAnon = await fetch(`${url}/rest/v1/presets?select=${encodeURIComponent(oldSelect)}&status=eq.published&limit=5`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    }
  });
  console.log("Old SELECT Anon Status:", resAnon.status, resAnon.statusText);
  const data = await resAnon.json();
  console.log("Presets in DB count:", data?.length);
  if (data?.length > 0) {
    console.log("Presets in DB:", data);
  } else {
    console.log("Response:", data);
  }
}

checkOldSelect().catch(console.error);
