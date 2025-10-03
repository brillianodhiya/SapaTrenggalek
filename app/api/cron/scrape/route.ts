import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { scrapeAllSources } from "@/lib/simple-scraper";
import { analyzeContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting scheduled scraping job...");

    // Scrape data from all sources using working scraper
    const scrapedData = await scrapeAllSources();
    console.log(`📊 Scraped ${scrapedData.length} items from sources`);

    if (scrapedData.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No new data found to process",
        timestamp: new Date().toISOString(),
      });
    }

    const processedEntries = [];
    const errors: string[] = [];

    // Process each scraped item with real Gemini AI
    for (let i = 0; i < scrapedData.length; i++) {
      const item = scrapedData[i];

      try {
        console.log(
          `🤖 Processing ${i + 1}/${
            scrapedData.length
          }: ${item.content.substring(0, 50)}...`
        );

        // Analyze content with working Gemini AI
        const aiAnalysis = await analyzeContent(item.content, item.source);
        console.log(
          `✅ AI Result: ${aiAnalysis.category} - ${aiAnalysis.sentiment}`
        );

        // Prepare data for database
        const entry = {
          content: item.content,
          source: item.source,
          source_url: item.source_url,
          author: item.author,
          category: aiAnalysis.category,
          sentiment: aiAnalysis.sentiment,
          urgency_level: aiAnalysis.urgency_level,
          hoax_probability: aiAnalysis.hoax_probability,
          status: "baru" as const,
          processed_by_ai: true,
          ai_analysis: aiAnalysis,
          related_entries: [],
          created_at: item.timestamp.toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert into database
        const { data, error } = await supabaseAdmin
          .from("data_entries")
          .insert(entry)
          .select();

        if (error) {
          console.error(`❌ Database insert error for item ${i + 1}:`, error);
          errors.push(`Item ${i + 1}: ${error.message}`);
        } else {
          processedEntries.push(data[0]);
          console.log(
            `✅ Saved: ${aiAnalysis.category} - ${aiAnalysis.sentiment}`
          );
        }

        // Add delay between AI calls to avoid rate limiting
        if (i < scrapedData.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Error processing item ${i + 1}:`, error);
        errors.push(
          `Item ${i + 1}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Find and group similar entries
    if (processedEntries.length > 1) {
      console.log("🔗 Grouping similar entries...");
      await groupSimilarEntries();
    }

    const response = {
      success: true,
      processed: processedEntries.length,
      scraped: scrapedData.length,
      errors: errors.length,
      message: `✅ Cron job completed! Processed ${processedEntries.length}/${scrapedData.length} entries`,
      timestamp: new Date().toISOString(),
      summary: {
        categories: processedEntries.reduce((acc, entry) => {
          acc[entry.category] = (acc[entry.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        urgent_items: processedEntries.filter(
          (entry) => entry.urgency_level >= 7
        ).length,
        potential_hoax: processedEntries.filter(
          (entry) => entry.hoax_probability >= 70
        ).length,
      },
    };

    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} errors occurred during processing`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function groupSimilarEntries() {
  // Get recent entries that haven't been grouped
  const { data: entries } = await supabaseAdmin
    .from("data_entries")
    .select("*")
    .eq("related_entries", "[]")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!entries || entries.length < 2) return;

  // Simple similarity detection based on keywords
  for (let i = 0; i < entries.length; i++) {
    const currentEntry = entries[i];
    const relatedIds = [];

    for (let j = i + 1; j < entries.length; j++) {
      const compareEntry = entries[j];

      // Check if entries share similar keywords or content
      const similarity = calculateSimilarity(
        currentEntry.ai_analysis?.keywords || [],
        compareEntry.ai_analysis?.keywords || []
      );

      if (similarity > 0.5) {
        relatedIds.push(compareEntry.id);
      }
    }

    // Update related entries if found
    if (relatedIds.length > 0) {
      await supabaseAdmin
        .from("data_entries")
        .update({ related_entries: relatedIds })
        .eq("id", currentEntry.id);
    }
  }
}

function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const intersection = keywords1.filter((k) => keywords2.includes(k));
  const unionSet = new Set([...keywords1, ...keywords2]);
  const union = Array.from(unionSet);

  return intersection.length / union.length;
}
