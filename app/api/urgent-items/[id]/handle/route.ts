import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { notes, user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    console.log(`🔧 Handling urgent item ${id} by user ${user_id}`);

    // Verify item exists and is urgent
    const { data: item, error: fetchError } = await supabaseAdmin
      .from("data_entries")
      .select("id, urgency_level, status, content")
      .eq("id", id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.urgency_level < 7) {
      return NextResponse.json(
        { error: "Item is not urgent (urgency level < 7)" },
        { status: 400 }
      );
    }

    // Update item status to handled
    const { error: updateError } = await supabaseAdmin
      .from("data_entries")
      .update({
        status: "handled",
        handled_by: user_id,
        handled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("❌ Error updating item status:", updateError);
      return NextResponse.json(
        { error: "Failed to update item status", details: updateError.message },
        { status: 500 }
      );
    }

    // Log the action
    const { error: logError } = await supabaseAdmin
      .from("urgent_item_actions")
      .insert({
        item_id: id,
        action_type: "handled",
        user_id: user_id,
        notes: notes || null,
        previous_status: item.status,
        new_status: "handled",
      });

    if (logError) {
      console.error("⚠️ Error logging action (item still updated):", logError);
    }

    console.log(`✅ Item ${id} marked as handled by ${user_id}`);

    return NextResponse.json({
      success: true,
      message: "Item marked as handled successfully",
      data: {
        id,
        status: "handled",
        handled_by: user_id,
        handled_at: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Handle item API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
