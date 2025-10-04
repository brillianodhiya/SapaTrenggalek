import { NextRequest, NextResponse } from "next/server";
import {
  findSimilarContent,
  detectPotentialHoax,
  findDuplicateContent,
} from "@/lib/embeddings";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      type = "similar",
      threshold,
      maxResults,
    } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query text is required" },
        { status: 400 }
      );
    }

    let results;

    switch (type) {
      case "similar":
        results = await findSimilarContent(
          query,
          threshold || 0.8,
          maxResults || 10
        );
        break;

      case "hoax":
        results = await detectPotentialHoax(query, threshold || 0.9);
        break;

      case "duplicate":
        results = await findDuplicateContent(query, threshold || 0.95);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid search type. Use: similar, hoax, or duplicate" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      query,
      type,
      results,
      count: Array.isArray(results)
        ? results.length
        : results.similarContent?.length || 0,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for simple similarity search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const threshold = parseFloat(searchParams.get("threshold") || "0.8");
    const maxResults = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const results = await findSimilarContent(query, threshold, maxResults);

    return NextResponse.json({
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
