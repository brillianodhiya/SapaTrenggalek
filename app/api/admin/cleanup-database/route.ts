import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development or with admin secret
    const authHeader = request.headers.get("authorization");
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasAdminSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isDevelopment && !hasAdminSecret) {
      return NextResponse.json(
        {
          error:
            "Unauthorized - This endpoint is only available in development or with admin secret",
        },
        { status: 401 }
      );
    }

    console.log("🧹 Starting database cleanup...");

    // Get current data count
    const { count: beforeCount } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    console.log(`📊 Current entries in database: ${beforeCount}`);

    // Option 1: Delete all test/sample data
    const { error: deleteError } = await supabaseAdmin
      .from("data_entries")
      .delete()
      .or(
        "source.eq.Manual Test,source.eq.Test Source,source.eq.Fallback News,source.eq.System Test,source.eq.System Fallback"
      );

    if (deleteError) {
      console.error("❌ Error deleting test data:", deleteError);
    } else {
      console.log(`✅ Deleted test entries`);
    }

    // Option 2: Delete old entries (older than 1 hour for testing)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { error: oldDeleteError } = await supabaseAdmin
      .from("data_entries")
      .delete()
      .lt("created_at", oneHourAgo);

    if (oldDeleteError) {
      console.error("❌ Error deleting old data:", oldDeleteError);
    } else {
      console.log(`✅ Deleted old entries`);
    }

    // Get final count
    const { count: afterCount } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    const totalDeleted = (beforeCount || 0) - (afterCount || 0);

    return NextResponse.json({
      success: true,
      message: `Database cleanup completed successfully!`,
      cleanup_summary: {
        entries_before: beforeCount || 0,
        entries_after: afterCount || 0,
        total_deleted: totalDeleted,
        cleanup_performed: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Alternative: Complete database reset (use with extreme caution)
export async function DELETE(request: NextRequest) {
  try {
    // Extra security for complete reset
    const authHeader = request.headers.get("authorization");
    const confirmHeader = request.headers.get("x-confirm-reset");
    const isDevelopment = process.env.NODE_ENV === "development";

    if (
      !isDevelopment ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}` ||
      confirmHeader !== "YES_DELETE_ALL"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized - Complete reset requires development mode + admin secret + confirmation header",
        },
        { status: 401 }
      );
    }

    console.log("🚨 COMPLETE DATABASE RESET - DELETING ALL DATA!");

    // Get count before deletion
    const { count: beforeCount } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    // Delete ALL entries
    const { error: deleteError } = await supabaseAdmin
      .from("data_entries")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (dummy condition)

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`);
    }

    // Verify deletion
    const { count: afterCount } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    console.log(
      `✅ COMPLETE RESET: Deleted ${beforeCount} entries, ${afterCount} remaining`
    );

    return NextResponse.json({
      success: true,
      message: "🚨 COMPLETE DATABASE RESET COMPLETED!",
      reset_summary: {
        entries_deleted: beforeCount || 0,
        entries_remaining: afterCount || 0,
      },
      warning: "ALL DATA HAS BEEN DELETED!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Complete database reset failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Complete database reset failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
