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
    const { reason, user_id, new_urgency_level } = body;

    if (!user_id || !reason) {
      return NextResponse.json(
        { error: "user_id and reason are required" },
        { status: 400 }
      );
    }

    console.log(`⬆️ Escalating urgent item ${id} by user ${user_id}`);

    // Verify item exists
    const { data: item, error: fetchError } = await supabaseAdmin
      .from("data_entries")
      .select("id, urgency_level, status, content")
      .eq("id", id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Calculate new urgency level (increase by 1 if not specified, max 10)
    const currentUrgency = item.urgency_level;
    const escalatedUrgency =
      new_urgency_level || Math.min(currentUrgency + 1, 10);

    // Update item status to escalated
    const { error: updateError } = await supabaseAdmin
      .from("data_entries")
      .update({
        status: "escalated",
        urgency_level: escalatedUrgency,
        escalated_at: new Date().toISOString(),
        escalation_reason: reason,
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
        action_type: "escalated",
        user_id: user_id,
        notes: reason,
        previous_status: item.status,
        new_status: "escalated",
      });

    if (logError) {
      console.error("⚠️ Error logging action (item still updated):", logError);
    }

    console.log(
      `✅ Item ${id} escalated by ${user_id} (urgency: ${currentUrgency} → ${escalatedUrgency})`
    );

    return NextResponse.json({
      success: true,
      message: "Item escalated successfully",
      data: {
        id,
        status: "escalated",
        urgency_level: escalatedUrgency,
        previous_urgency: currentUrgency,
        escalated_at: new Date().toISOString(),
        escalation_reason: reason,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Escalate item API error:", error);
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
