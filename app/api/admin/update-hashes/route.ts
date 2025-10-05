import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateContentHash } from "@/lib/content-hash";

export const runtime = "nodejs";

export async function POST() {
  try {
    console.log("🔄 Starting content hash update...");

    // Get all entries without content_hash
    const { data: entries, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content")
      .is("content_hash", null)
      .limit(100); // Process in batches

    if (error) {
      console.error("❌ Error fetching entries:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    console.log(`📊 Processing ${entries.length} entries...`);

    let updated = 0;
    const errors = [];

    for (const entry of entries) {
      try {
        const hash = generateContentHash(entry.content);

        const { error: updateError } = await supabaseAdmin
          .from("data_entries")
          .update({ content_hash: hash })
          .eq("id", entry.id);

        if (updateError) {
          errors.push({ id: entry.id, error: updateError.message });
        } else {
          updated++;
        }
      } catch (err) {
        errors.push({ id: entry.id, error: err.message });
      }
    }

    console.log(`✅ Updated ${updated} entries`);
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} errors occurred`);
    }

    return NextResponse.json({
      success: true,
      processed: entries.length,
      updated,
      errors: errors.length,
      errorDetails: errors.slice(0, 5), // Show first 5 errors
    });
  } catch (error) {
    console.error("❌ Hash update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
