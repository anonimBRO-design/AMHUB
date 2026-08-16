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

const PRESET_SELECT_WITH_CREATOR = `id,slug,title,description,thumbnail_url,preview_video_url,file_type,file_url,am_link,category,difficulty,tags,status,download_count,view_count,like_count,bookmark_count,comment_count,is_featured,created_at,creator:users!presets_creator_id_fkey(id,username,display_name,avatar_url,is_verified)`;

async function testE2E() {
  console.log("==================================================");
  console.log("RUNNING E2E PRESET FLOW VERIFICATION");
  console.log("==================================================\n");

  console.log("TEST 1: Query existing preset by slug (malam-pagi-1599)");
  const resSlug = await fetch(`${url}/rest/v1/presets?select=${encodeURIComponent(PRESET_SELECT_WITH_CREATOR)}&slug=eq.malam-pagi-1599&status=eq.published`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    }
  });
  console.log("Status:", resSlug.status, resSlug.statusText);
  const slugData = await resSlug.json();
  if (slugData?.length > 0) {
    console.log("✅ PASSED: Detail query returns preset record:", {
      id: slugData[0].id,
      slug: slugData[0].slug,
      title: slugData[0].title,
      creator: slugData[0].creator?.display_name
    });
  } else {
    throw new Error("Failed: Preset malam-pagi-1599 not found!");
  }

  console.log("\nTEST 2: Query catalog list (listPublishedPresets)");
  const resCatalog = await fetch(`${url}/rest/v1/presets?select=${encodeURIComponent(PRESET_SELECT_WITH_CREATOR)}&status=eq.published&order=created_at.desc&limit=24`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    }
  });
  console.log("Status:", resCatalog.status, resCatalog.statusText);
  const catalogData = await resCatalog.json();
  console.log("Catalog presets count:", catalogData?.length);
  const found = catalogData?.some(p => p.slug === 'malam-pagi-1599');
  if (found) {
    console.log("✅ PASSED: Uploaded preset appears in the public catalog!");
  } else {
    throw new Error("Failed: malam-pagi-1599 not found in catalog!");
  }

  console.log("\nTEST 3: Creator profile presets query (listCreatorPresets)");
  const creatorId = slugData[0].creator?.id;
  const resCreator = await fetch(`${url}/rest/v1/presets?select=${encodeURIComponent(PRESET_SELECT_WITH_CREATOR)}&creator_id=eq.${creatorId}&order=created_at.desc`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    }
  });
  console.log("Status:", resCreator.status, resCreator.statusText);
  const creatorPresets = await resCreator.json();
  console.log("Creator presets count:", creatorPresets?.length);
  if (creatorPresets?.length > 0) {
    console.log("✅ PASSED: Creator profile correctly lists the preset!");
  } else {
    throw new Error("Failed: Creator presets empty!");
  }

  console.log("\n==================================================");
  console.log("ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

testE2E().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
