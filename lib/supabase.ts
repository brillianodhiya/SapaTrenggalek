import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DataEntry {
  id: string;
  content: string;
  source: string;
  source_url: string;
  author: string;
  category: "berita" | "laporan" | "aspirasi" | "lainnya";
  sentiment: "positif" | "negatif" | "netral";
  urgency_level: number;
  hoax_probability: number;
  status: "baru" | "diverifikasi" | "diteruskan" | "dikerjakan" | "selesai";
  created_at: string;
  updated_at: string;
  processed_by_ai: boolean;
  ai_analysis: any;
  related_entries: string[];
}
