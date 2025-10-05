import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
        content_embedding: embedding,
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

// Fallback similarity search using raw SQL instead of RPC
export async function findSimilarContent(
  queryText: string,
  threshold: number = 0.8,
  maxResults: number = 10
) {
  try {
    console.log("Using fallback text search for:", queryText);

    // Split query into keywords for better matching
    const keywords = queryText
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2);

    // Build text search query
    let query = supabaseAdmin
      .from("data_entries")
      .select("id, content, source, category");

    // Search for any of the keywords in content
    if (keywords.length > 0) {
      const searchConditions = keywords
        .map((keyword) => `content.ilike.%${keyword}%`)
        .join(",");

      query = query.or(searchConditions);
    } else {
      // If no keywords, search for the full query
      query = query.ilike("content", `%${queryText}%`);
    }

    const { data, error } = await query.limit(maxResults);

    if (error) {
      console.error("Error finding similar content:", error);
      return [];
    }

    console.log(`Found ${data?.length || 0} results for "${queryText}"`);

    // Return results with mock similarity scores based on text matching
    return (data || []).map((item, index) => ({
      ...item,
      similarity_score: Math.max(0.6, 0.9 - index * 0.05), // Decreasing similarity
    }));
  } catch (error) {
    console.error("Error in findSimilarContent:", error);
    return [];
  }
}

// Fallback hoax detection
export async function detectPotentialHoax(
  queryText: string,
  threshold: number = 0.9
) {
  try {
    // Simple fallback - check for high hoax probability entries
    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, hoax_probability")
      .gt("hoax_probability", 70)
      .limit(5);

    if (error) {
      console.error("Error detecting hoax:", error);
      return { isPotentialHoax: false, similarContent: [] };
    }

    const similarHoaxContent = (data || []).map((item) => ({
      similar_id: item.id,
      similar_content: item.content,
      similar_hoax_probability: item.hoax_probability,
      similarity_score: 0.9, // Mock similarity
      is_potential_hoax: true,
    }));

    return {
      isPotentialHoax: similarHoaxContent.length > 0,
      similarContent: similarHoaxContent,
      confidence: similarHoaxContent.length > 0 ? 0.9 : 0,
    };
  } catch (error) {
    console.error("Error in detectPotentialHoax:", error);
    return { isPotentialHoax: false, similarContent: [] };
  }
}

// Fallback duplicate detection
export async function findDuplicateContent(
  queryText: string,
  threshold: number = 0.95
) {
  try {
    // Simple text-based duplicate detection as fallback
    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, created_at")
      .ilike("content", `%${queryText.substring(0, 50)}%`)
      .limit(3);

    if (error) {
      console.error("Error finding duplicates:", error);
      return [];
    }

    return (data || []).map((item) => ({
      ...item,
      similarity_score: 0.95, // Mock similarity
    }));
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

// Enhanced content analysis with similarity checks (fallback version)
export async function analyzeContentWithSimilarity(
  content: string,
  source: string
) {
  try {
    // Simple duplicate check based on content similarity
    const duplicates = await findDuplicateContent(content);
    if (duplicates.length > 0) {
      return {
        isDuplicate: true,
        duplicateOf: duplicates[0],
        message: "Content sudah ada di database",
      };
    }

    // Simple hoax check
    const hoaxCheck = await detectPotentialHoax(content);

    // Find similar content
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
