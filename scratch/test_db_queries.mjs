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

async function testAll() {
  console.log("=== Testing getPresetBySlug with slug 'malam-pagi-1599' ===");
  
  const SAFE_SELECT = `id,slug,title,description,thumbnail_url,preview_video_url,file_type,file_url,am_link,category,difficulty,tags,status,download_count,view_count,like_count,bookmark_count,comment_count,is_featured,created_at,creator:users!presets_creator_id_fkey(id,username,display_name,avatar_url,is_verified)`;

  const resSlug = await fetch(`${url}/rest/v1/presets?select=${encodeURIComponent(SAFE_SELECT)}&slug=eq.malam-pagi-1599&status=eq.published`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    }
  });

  const slugData = await resSlug.json();
  console.log("getPresetBySlug status:", resSlug.status, resSlug.statusText);
  console.log("getPresetBySlug result count:", slugData?.length);
  if (slugData?.length > 0) {
    console.log("Preset loaded:", {
      id: slugData[0].id,
      slug: slugData[0].slug,
      title: slugData[0].title,
      creator: slugData[0].creator
    });
  } else {
    console.log("Error or empty:", slugData);
  }

  console.log("\n=== Testing listPublishedPresets ===");
  const resList = await fetch(`${url}/rest/v1/presets?select=${encodeURIComponent(SAFE_SELECT)}&status=eq.published&order=created_at.desc&limit=10`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    }
  });
  const listData = await resList.json();
  console.log("listPublishedPresets status:", resList.status, resList.statusText);
  console.log("listPublishedPresets count:", listData?.length);
  if (listData?.length > 0) {
    console.log("Presets in catalog:", listData.map(p => ({ slug: p.slug, title: p.title, creator: p.creator?.username })));
  }
}

testAll().catch(console.error);
