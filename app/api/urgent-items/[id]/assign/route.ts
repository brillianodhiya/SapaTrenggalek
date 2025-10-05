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
    const { assigned_to, department, user_id, notes } = body;

    if (!user_id || !assigned_to) {
      return NextResponse.json(
        { error: "user_id and assigned_to are required" },
        { status: 400 }
      );
    }

    console.log(
      `👤 Assigning urgent item ${id} to ${assigned_to} by user ${user_id}`
    );

    // Verify item exists
    const { data: item, error: fetchError } = await supabaseAdmin
      .from("data_entries")
      .select("id, urgency_level, status, content")
      .eq("id", id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update item status to assigned
    const { error: updateError } = await supabaseAdmin
      .from("data_entries")
      .update({
        status: "assigned",
        assigned_to: assigned_to,
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
        action_type: "assigned",
        user_id: user_id,
        assigned_to: assigned_to,
        department: department || null,
        notes: notes || null,
        previous_status: item.status,
        new_status: "assigned",
      });

    if (logError) {
      console.error("⚠️ Error logging action (item still updated):", logError);
    }

    console.log(
      `✅ Item ${id} assigned to ${assigned_to} (${
        department || "no department"
      }) by ${user_id}`
    );

    return NextResponse.json({
      success: true,
      message: "Item assigned successfully",
      data: {
        id,
        status: "assigned",
        assigned_to: assigned_to,
        department: department || null,
        assigned_at: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Assign item API error:", error);
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
