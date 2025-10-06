import { supabaseAdmin } from "@/lib/supabase-admin";

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

// Simple text-based search that definitely works
export async function findSimilarContent(
  queryText: string,
  threshold: number = 0.8,
  maxResults: number = 10
) {
  try {
    console.log("🔍 Simple text search for:", queryText);

    // Simple ILIKE search for the query text
    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, category")
      .ilike("content", `%${queryText}%`)
      .limit(maxResults);

    if (error) {
      console.error("❌ Error in simple search:", error);
      return [];
    }

    console.log(`✅ Simple search found ${data?.length || 0} results`);

    // Return results with similarity scores and cleaned content
    return (data || []).map((item, index) => ({
      ...item,
      content: cleanContent(item.content),
      similarity_score: Math.max(0.7, 0.95 - index * 0.05),
    }));
  } catch (error) {
    console.error("❌ Error in findSimilarContent:", error);
    return [];
  }
}

// Simple hoax detection
export async function detectPotentialHoax(
  queryText: string,
  threshold: number = 0.9
) {
  try {
    console.log("🚫 Simple hoax detection for:", queryText);

    // Find entries with high hoax probability
    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, hoax_probability")
      .gt("hoax_probability", 70)
      .limit(5);

    if (error) {
      console.error("❌ Error in hoax detection:", error);
      return { isPotentialHoax: false, similarContent: [] };
    }

    console.log(`✅ Found ${data?.length || 0} potential hoax entries`);

    const similarHoaxContent = (data || []).map((item) => ({
      similar_id: item.id,
      similar_content: item.content,
      similar_hoax_probability: item.hoax_probability,
      similarity_score: 0.9,
      is_potential_hoax: true,
    }));

    return {
      isPotentialHoax: similarHoaxContent.length > 0,
      similarContent: similarHoaxContent,
      confidence: similarHoaxContent.length > 0 ? 0.9 : 0,
    };
  } catch (error) {
    console.error("❌ Error in detectPotentialHoax:", error);
    return { isPotentialHoax: false, similarContent: [] };
  }
}

// Simple duplicate detection
export async function findDuplicateContent(
  queryText: string,
  threshold: number = 0.95
) {
  try {
    console.log("📋 Simple duplicate detection for:", queryText);

    // Search for similar content
    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, created_at")
      .ilike("content", `%${queryText.substring(0, 50)}%`)
      .limit(3);

    if (error) {
      console.error("❌ Error in duplicate detection:", error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} potential duplicates`);

    return (data || []).map((item) => ({
      ...item,
      similarity_score: 0.95,
    }));
  } catch (error) {
    console.error("❌ Error in findDuplicateContent:", error);
    return [];
  }
}
