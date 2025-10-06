import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Clean content function to remove URLs and HTML
function cleanContent(content: string): string {
  return content
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&lt;[^&]*&gt;/g, "") // Remove encoded HTML
    .replace(/&[a-zA-Z]+;/g, "") // Remove HTML entities
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
}

// Generate embedding for text content
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const result = await model.embedContent(text);
    const embedding = result.embedding;

    if (!embedding || !embedding.values) {
      throw new Error("No embedding values returned");
    }

    return embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return zero vector as fallback
    return new Array(768).fill(0);
  }
}

// Update embedding for existing entry
export async function updateEntryEmbedding(
  entryId: string,
  content: string
): Promise<boolean> {
  try {
    const embedding = await generateEmbedding(content);

    const { error } = await supabaseAdmin
      .from("data_entries")
      .update({
        content_embedding: embedding, // Let Supabase handle the vector conversion
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    if (error) {
      console.error("Error updating embedding:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateEntryEmbedding:", error);
    return false;
  }
}

// Find similar content using vector similarity
export async function findSimilarContent(
  queryText: string,
  threshold: number = 0.8,
  maxResults: number = 10
) {
  try {
    const queryEmbedding = await generateEmbedding(queryText);

    const { data, error } = await supabaseAdmin.rpc("find_similar_content", {
      query_embedding: queryEmbedding, // Let Supabase handle the vector conversion
      similarity_threshold: threshold,
      max_results: maxResults,
    });

    if (error) {
      console.error("Error finding similar content:", error);
      return [];
    }

    // Clean content in results
    return (data || []).map((item: { content: any }) => ({
      ...item,
      content: cleanContent(item.content || ""),
    }));
  } catch (error) {
    console.error("Error in findSimilarContent:", error);
    return [];
  }
}

// Detect potential hoax based on similarity to known hoax content
export async function detectPotentialHoax(
  queryText: string,
  threshold: number = 0.9
) {
  try {
    const queryEmbedding = await generateEmbedding(queryText);

    const { data, error } = await supabaseAdmin.rpc("detect_potential_hoax", {
      query_embedding: queryEmbedding, // Let Supabase handle the vector conversion
      content_text: queryText,
      similarity_threshold: threshold,
    });

    if (error) {
      console.error("Error detecting hoax:", error);
      return { isPotentialHoax: false, similarContent: [] };
    }

    const similarHoaxContent = data || [];
    const isPotentialHoax = similarHoaxContent.some(
      (item: any) => item.is_potential_hoax
    );

    return {
      isPotentialHoax,
      similarContent: similarHoaxContent,
      confidence:
        similarHoaxContent.length > 0
          ? similarHoaxContent[0].similarity_score
          : 0,
    };
  } catch (error) {
    console.error("Error in detectPotentialHoax:", error);
    return { isPotentialHoax: false, similarContent: [] };
  }
}

// Check for duplicate content
export async function findDuplicateContent(
  queryText: string,
  threshold: number = 0.95
) {
  try {
    const queryEmbedding = await generateEmbedding(queryText);

    const { data, error } = await supabaseAdmin.rpc("find_duplicate_content", {
      query_embedding: queryEmbedding, // Let Supabase handle the vector conversion
      similarity_threshold: threshold,
    });

    if (error) {
      console.error("Error finding duplicates:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in findDuplicateContent:", error);
    return [];
  }
}

// Batch update embeddings for existing entries
export async function batchUpdateEmbeddings(
  limit: number = 50
): Promise<number> {
  try {
    // Get entries without embeddings
    const { data: entries, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content")
      .is("content_embedding", null)
      .limit(limit);

    if (error || !entries) {
      console.error("Error fetching entries:", error);
      return 0;
    }

    let updatedCount = 0;

    for (const entry of entries) {
      const success = await updateEntryEmbedding(entry.id, entry.content);
      if (success) {
        updatedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Updated embeddings for ${updatedCount} entries`);
    return updatedCount;
  } catch (error) {
    console.error("Error in batchUpdateEmbeddings:", error);
    return 0;
  }
}

// Enhanced content analysis with similarity checks
export async function analyzeContentWithSimilarity(
  content: string,
  source: string
) {
  try {
    // Check for duplicates first
    const duplicates = await findDuplicateContent(content);
    if (duplicates.length > 0) {
      return {
        isDuplicate: true,
        duplicateOf: duplicates[0],
        message: "Content sudah ada di database",
      };
    }

    // Check for potential hoax
    const hoaxCheck = await detectPotentialHoax(content);

    // Find similar content for context
    const similarContent = await findSimilarContent(content, 0.7, 5);

    return {
      isDuplicate: false,
      isPotentialHoax: hoaxCheck.isPotentialHoax,
      hoaxConfidence: hoaxCheck.confidence,
      similarContent: similarContent,
      hoaxSimilarContent: hoaxCheck.similarContent,
    };
  } catch (error) {
    console.error("Error in analyzeContentWithSimilarity:", error);
    return {
      isDuplicate: false,
      isPotentialHoax: false,
      hoaxConfidence: 0,
      similarContent: [],
      hoaxSimilarContent: [],
    };
  }
}
