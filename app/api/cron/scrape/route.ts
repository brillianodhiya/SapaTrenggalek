import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { scrapeAllSources } from "@/lib/simple-scraper";
import { analyzeContent } from "@/lib/gemini";
import { generateContentHash } from "@/lib/content-hash";
import { updateEntryEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

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
    const duplicateSkipped = [];
    const errors: string[] = [];
    const embeddingQueue = []; // Queue for embedding generation

    // Limit processing to avoid timeout (max 10 items per run)
    const maxItemsPerRun = 10;
    const itemsToProcess = scrapedData.slice(0, maxItemsPerRun);

    if (scrapedData.length > maxItemsPerRun) {
      console.log(
        `⚠️ Limited processing to ${maxItemsPerRun} items (${scrapedData.length} total scraped)`
      );
    }

    // Process each scraped item with real Gemini AI
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];

      try {
        console.log(
          `🤖 Processing ${i + 1}/${
            itemsToProcess.length
          }: ${item.content.substring(0, 50)}...`
        );

        // Generate content hash for duplicate detection
        const contentHash = generateContentHash(item.content);

        // Check if content already exists
        const { data: existingEntry, error: checkError } = await supabaseAdmin
          .from("data_entries")
          .select("id, content")
          .eq("content_hash", contentHash)
          .limit(1);

        if (checkError) {
          console.error(`❌ Error checking duplicates:`, checkError);
        } else if (existingEntry && existingEntry.length > 0) {
          console.log(`⏭️ Skipping duplicate content (hash: ${contentHash})`);
          duplicateSkipped.push({
            content: item.content.substring(0, 100),
            hash: contentHash,
            existingId: existingEntry[0].id,
          });
          continue; // Skip this item
        }

        // Analyze content with working Gemini AI
        const aiAnalysis = await analyzeContent(item.content, item.source);
        console.log(
          `✅ AI Result: ${aiAnalysis.category} - ${aiAnalysis.sentiment}`
        );

        // Prepare data for database with content hash
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
          content_hash: contentHash, // Add content hash
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
          errors.push(`Item ${i + 1}: ${error?.message || "Database error"}`);
        } else {
          processedEntries.push(data[0]);
          console.log(
            `✅ Saved: ${aiAnalysis.category} - ${aiAnalysis.sentiment}`
          );

          // Queue entry for embedding generation (don't wait for it)
          embeddingQueue.push({
            id: data[0].id,
            content: item.content,
          });
          console.log(`📝 Queued embedding generation for entry ${data[0].id}`);
        }

        // Add delay between AI calls to avoid rate limiting
        if (i < itemsToProcess.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Reduced delay since no embedding generation
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
      limited: scrapedData.length > maxItemsPerRun,
      duplicatesSkipped: duplicateSkipped.length,
      errors: errors.length,
      embeddingsQueued: embeddingQueue.length,
      message: `✅ Cron job completed! Processed ${processedEntries.length}/${itemsToProcess.length} entries (${duplicateSkipped.length} duplicates skipped, ${embeddingQueue.length} embeddings queued)`,
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
        duplicates_prevented: duplicateSkipped.length,
      },
      duplicateDetails: duplicateSkipped.slice(0, 5), // Show first 5 duplicates
      performance: {
        maxItemsPerRun,
        totalScraped: scrapedData.length,
        actualProcessed: itemsToProcess.length,
        embeddingsQueued: embeddingQueue.length,
      },
    };

    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} errors occurred during processing`);
    }

    // Process embeddings asynchronously after response (don't wait)
    if (embeddingQueue.length > 0) {
      console.log(
        `🔗 Starting async embedding generation for ${embeddingQueue.length} entries...`
      );
      processEmbeddingsAsync(embeddingQueue);
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

async function processEmbeddingsAsync(
  embeddingQueue: Array<{ id: string; content: string }>
) {
  console.log(
    `🔗 Processing ${embeddingQueue.length} embeddings asynchronously...`
  );

  for (const item of embeddingQueue) {
    try {
      await updateEntryEmbedding(item.id, item.content);
      console.log(`✅ Embedding generated for entry ${item.id}`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`⚠️ Async embedding failed for entry ${item.id}:`, error);
      // Continue with next item even if one fails
    }
  }

  console.log(`🎉 Async embedding generation completed`);
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
