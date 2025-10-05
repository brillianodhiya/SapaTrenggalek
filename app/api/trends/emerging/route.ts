import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const velocityThreshold = parseFloat(
      searchParams.get("velocityThreshold") || "50"
    );
    const urgencyMin = parseInt(searchParams.get("urgencyMin") || "4");
    const departments = searchParams
      .get("departments")
      ?.split(",")
      .filter(Boolean);
    const status = searchParams.get("status") || "active";

    console.log("🚨 Fetching emerging issues from Supabase with filters:", {
      velocityThreshold,
      urgencyMin,
      departments,
      status,
    });

    // Query emerging issues from Supabase
    let query = supabase
      .from("emerging_issues")
      .select("*")
      .gte("velocity", velocityThreshold)
      .gte("urgency_score", urgencyMin)
      .eq("status", status)
      .order("urgency_score", { ascending: false })
      .order("velocity", { ascending: false });

    const { data: emergingIssues, error } = await query;

    if (error) {
      console.error("❌ Error fetching emerging issues from Supabase:", error);
      throw error;
    }

    // Add additional computed fields
    const processedIssues = (emergingIssues || []).map((issue) => ({
      ...issue,
      department_relevance:
        issue.department_relevance ||
        determineDepartmentRelevance(issue.keywords),
      geographic_distribution: { Trenggalek: 100 }, // Mock data
      growth_trend: issue.velocity > 100 ? "accelerating" : "steady",
      estimated_peak: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      related_entries_count: Math.floor(Math.random() * 20) + 5, // Mock data
      mention_count: Math.floor(issue.velocity * 2), // Estimate based on velocity
      first_mention: issue.first_detected,
    }));

    console.log(
      `✅ Found ${processedIssues.length} emerging issues from Supabase`
    );

    // Calculate metadata
    const velocityValues = processedIssues.map((i) => i.velocity);
    const velocityRange =
      velocityValues.length > 0
        ? {
            min: Math.min(...velocityValues),
            max: Math.max(...velocityValues),
            avg:
              velocityValues.reduce((sum, v) => sum + v, 0) /
              velocityValues.length,
          }
        : { min: 0, max: 0, avg: 0 };

    const urgencyDistribution = processedIssues.reduce((acc: any, issue) => {
      const level =
        issue.urgency_score >= 8
          ? "high"
          : issue.urgency_score >= 6
          ? "medium"
          : "low";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: processedIssues,
      metadata: {
        total_issues: processedIssues.length,
        filters_applied: {
          velocityThreshold,
          urgencyMin,
          departments,
          status,
        },
        velocity_range: velocityRange,
        urgency_distribution: urgencyDistribution,
        generated_at: new Date().toISOString(),
        data_source: "supabase",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Emerging issues API error:", error);
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

function determineDepartmentRelevance(keywords: string[]): string[] {
  const departments: string[] = [];

  const keywordString = keywords.join(" ").toLowerCase();

  if (
    keywordString.includes("jalan") ||
    keywordString.includes("infrastruktur") ||
    keywordString.includes("perbaikan")
  ) {
    departments.push("Dinas Pekerjaan Umum");
  }

  if (
    keywordString.includes("kesehatan") ||
    keywordString.includes("rumah sakit") ||
    keywordString.includes("dokter")
  ) {
    departments.push("Dinas Kesehatan");
  }

  if (
    keywordString.includes("pendidikan") ||
    keywordString.includes("sekolah") ||
    keywordString.includes("siswa")
  ) {
    departments.push("Dinas Pendidikan");
  }

  if (
    keywordString.includes("ekonomi") ||
    keywordString.includes("usaha") ||
    keywordString.includes("perdagangan")
  ) {
    departments.push("Dinas Perdagangan");
  }

  if (
    keywordString.includes("lingkungan") ||
    keywordString.includes("sampah") ||
    keywordString.includes("kebersihan")
  ) {
    departments.push("Dinas Lingkungan Hidup");
  }

  // Default to general administration if no specific department
  if (departments.length === 0) {
    departments.push("Sekretariat Daerah");
  }

  return departments;
}
