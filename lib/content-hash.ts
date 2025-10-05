import crypto from "crypto";

// Generate content hash for deduplication
export function generateContentHash(content: string): string {
  // Normalize content before hashing
  const normalized = content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Use first 200 characters for hash to avoid minor differences
  const hashContent = normalized.substring(0, 200);

  return crypto
    .createHash("sha256")
    .update(hashContent)
    .digest("hex")
    .substring(0, 16); // Use first 16 chars for shorter hash
}

// Check if content is likely duplicate based on hash
export function isDuplicateContent(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}

// Extract title from content for better comparison
export function extractContentTitle(content: string): string {
  const lines = content.split("\n");
  const firstLine = lines[0] || "";

  // Remove HTML tags and clean up
  const cleaned = firstLine
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, "")
    .trim();

  return cleaned.length > 100 ? cleaned.substring(0, 100) : cleaned;
}
