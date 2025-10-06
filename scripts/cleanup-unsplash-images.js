require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupUnsplashImages() {
  try {
    console.log("🧹 Starting cleanup of Unsplash placeholder images...\n");

    // First, check how many entries have Unsplash images
    const { data: unsplashEntries, error: fetchError } = await supabase
      .from("data_entries")
      .select("id, image_url")
      .like("image_url", "%unsplash%");

    if (fetchError) {
      console.error("Error fetching Unsplash entries:", fetchError);
      return;
    }

    if (!unsplashEntries || unsplashEntries.length === 0) {
      console.log("✅ No Unsplash images found - cleanup not needed");
      return;
    }

    console.log(`Found ${unsplashEntries.length} entries with Unsplash images`);
    console.log("Sample URLs:");
    unsplashEntries.slice(0, 3).forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.image_url.substring(0, 80)}...`);
    });

    console.log("\n🗑️ Removing Unsplash placeholder images...");

    // Remove Unsplash images by setting image_url to null
    const { data: updateResult, error: updateError } = await supabase
      .from("data_entries")
      .update({
        image_url: null,
        image_alt: null,
        image_caption: null,
      })
      .like("image_url", "%unsplash%");

    if (updateError) {
      console.error("❌ Error updating entries:", updateError);
      return;
    }

    console.log(`✅ Successfully cleaned up ${unsplashEntries.length} entries`);
    console.log("📊 All Unsplash placeholder images have been removed");
    console.log("🎯 Entries now have empty image_url (as requested)");

    // Verify cleanup
    const { data: remainingUnsplash, error: verifyError } = await supabase
      .from("data_entries")
      .select("id")
      .like("image_url", "%unsplash%");

    if (verifyError) {
      console.error("Error verifying cleanup:", verifyError);
      return;
    }

    if (remainingUnsplash && remainingUnsplash.length > 0) {
      console.log(
        `⚠️ Warning: ${remainingUnsplash.length} Unsplash images still remain`
      );
    } else {
      console.log("✅ Verification passed - no Unsplash images remain");
    }

    console.log("\n=== Cleanup Complete ===");
  } catch (error) {
    console.error("Error in cleanup:", error);
  }
}

cleanupUnsplashImages().catch(console.error);
