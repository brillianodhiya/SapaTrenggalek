import { NextRequest, NextResponse } from "next/server";
// Try main embeddings first, fallback if vector operations fail
import {
  findSimilarContent,
  detectPotentialHoax,
  findDuplicateContent,
} from "@/lib/embeddings";
import {
  findSimilarContent as findSimilarContentSimple,
  detectPotentialHoax as detectPotentialHoaxSimple,
  findDuplicateContent as findDuplicateContentSimple,
} from "@/lib/embeddings-simple";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("🚀 =================================");
  console.log("🚀 SEARCH API POST ROUTE CALLED!");
  console.log("🚀 =================================");
  try {
    console.log("🚀 Search API POST called");
    const requestBody = await request.json();
    console.log("📥 Request body:", requestBody);

    const { query, type = "similar", threshold, maxResults } = requestBody;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query text is required" },
        { status: 400 }
      );
    }

    let results;

    switch (type) {
      case "similar":
        try {
          results = await findSimilarContent(
            query,
            threshold || 0.8,
            maxResults || 10
          );
        } catch (error) {
          console.log("Vector search failed, using simple search:", error);
          results = await findSimilarContentSimple(
            query,
            threshold || 0.8,
            maxResults || 10
          );
        }
        break;

      case "hoax":
        try {
          results = await detectPotentialHoax(query, threshold || 0.9);
        } catch (error) {
          console.log(
            "Vector hoax detection failed, using simple search:",
            error
          );
          results = await detectPotentialHoaxSimple(query, threshold || 0.9);
        }
        break;

      case "duplicate":
        try {
          results = await findDuplicateContent(query, threshold || 0.95);
        } catch (error) {
          console.log(
            "Vector duplicate detection failed, using simple search:",
            error
          );
          results = await findDuplicateContentSimple(query, threshold || 0.95);
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid search type. Use: similar, hoax, or duplicate" },
          { status: 400 }
        );
    }

    const response = {
      query,
      type,
      results,
      count: Array.isArray(results)
        ? results.length
        : results.similarContent?.length || 0,
    };

    console.log("📤 API Response:", {
      query: response.query,
      type: response.type,
      count: response.count,
      hasResults: response.results && response.results.length > 0,
    });

    return NextResponse.json(response);
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
  console.log("🚀 =================================");
  console.log("🚀 SEARCH API GET ROUTE CALLED!");
  console.log("🚀 =================================");
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

    let results;
    try {
      results = await findSimilarContent(query, threshold, maxResults);
    } catch (error) {
      console.log("Vector search failed in GET, using simple search:", error);
      results = await findSimilarContentSimple(query, threshold, maxResults);
    }

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
