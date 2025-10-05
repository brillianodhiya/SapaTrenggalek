import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateContentHash } from "@/lib/content-hash";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  try {
    // Check if Supabase is configured
    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      console.log("Supabase not configured, returning demo data");
      return NextResponse.json(
        getDemoEntries(page, limit, category, status, search)
      );
    }

    let query = supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`content.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.log("Database error, returning demo data:", error);
      return NextResponse.json(
        getDemoEntries(page, limit, category, status, search)
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Entries API error:", error);
    // Return demo data instead of error
    return NextResponse.json(
      getDemoEntries(page, limit, category, status, search)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, source, author, category } = await request.json();

    if (!content || !source) {
      return NextResponse.json(
        { error: "Content and source are required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      console.log("Supabase not configured, simulating entry creation");
      return NextResponse.json({
        data: {
          id: Date.now().toString(),
          content,
          source,
          author: author || "Unknown",
          category: category || "lainnya",
          created_at: new Date().toISOString(),
        },
      });
    }

    // Generate content hash for duplicate detection
    const contentHash = generateContentHash(content);

    // Check if content already exists
    const { data: existingEntry, error: checkError } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, created_at")
      .eq("content_hash", contentHash)
      .limit(1);

    if (checkError) {
      console.error("Error checking duplicates:", checkError);
      return NextResponse.json(
        { error: "Error checking duplicates" },
        { status: 500 }
      );
    }

    if (existingEntry && existingEntry.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate content detected",
          duplicate: {
            id: existingEntry[0].id,
            created_at: existingEntry[0].created_at,
            content_preview: existingEntry[0].content.substring(0, 100) + "...",
          },
        },
        { status: 409 }
      );
    }

    // Create new entry
    const entry = {
      content,
      source,
      author: author || "Unknown",
      category: category || "lainnya",
      sentiment: "netral",
      urgency_level: 5,
      hoax_probability: 0,
      status: "baru",
      processed_by_ai: false,
      content_hash: contentHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .insert(entry)
      .select();

    if (error) {
      console.error("Error creating entry:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error("POST entries error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, notes } = await request.json();

    // Check if Supabase is configured
    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      console.log("Supabase not configured, simulating status update");
      return NextResponse.json({
        data: { id, status, updated_at: new Date().toISOString() },
      });
    }

    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(notes && { admin_notes: notes }),
      })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error("PATCH entries error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getDemoEntries(
  page: number,
  limit: number,
  category?: string | null,
  status?: string | null,
  search?: string | null
) {
  const demoData = [
    {
      id: "1",
      content:
        "Laporan kerusakan jalan di Kecamatan Trenggalek yang mengganggu aktivitas warga sehari-hari. Jalan berlubang dan bergelombang menyebabkan kemacetan dan kecelakaan kecil.",
      source: "WhatsApp",
      source_url: "",
      author: "Warga Trenggalek",
      category: "laporan",
      sentiment: "negatif",
      urgency_level: 8,
      hoax_probability: 15,
      status: "baru",
      created_at: new Date().toISOString(),
      ai_analysis: null,
    },
    {
      id: "2",
      content:
        "Berita positif tentang pembangunan infrastruktur baru di Kabupaten Trenggalek. Pemerintah daerah berkomitmen meningkatkan fasilitas publik untuk kesejahteraan masyarakat.",
      source: "Website Resmi",
      source_url: "https://trenggalekkab.go.id",
      author: "Humas Pemkab",
      category: "berita",
      sentiment: "positif",
      urgency_level: 3,
      hoax_probability: 5,
      status: "diverifikasi",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      ai_analysis: null,
    },
    {
      id: "3",
      content:
        "Aspirasi masyarakat untuk peningkatan pelayanan kesehatan di Puskesmas. Warga mengharapkan penambahan tenaga medis dan fasilitas yang lebih lengkap.",
      source: "Facebook",
      source_url: "",
      author: "Komunitas Sehat",
      category: "aspirasi",
      sentiment: "netral",
      urgency_level: 6,
      hoax_probability: 10,
      status: "diteruskan",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      ai_analysis: null,
    },
    {
      id: "4",
      content:
        "Informasi hoaks tentang program bantuan pemerintah yang tidak benar. Masyarakat diminta untuk selalu memverifikasi informasi melalui sumber resmi.",
      source: "Twitter",
      source_url: "",
      author: "Akun Anonim",
      category: "lainnya",
      sentiment: "negatif",
      urgency_level: 9,
      hoax_probability: 85,
      status: "dikerjakan",
      created_at: new Date(Date.now() - 259200000).toISOString(),
      ai_analysis: null,
    },
    {
      id: "5",
      content:
        "Laporan kegiatan gotong royong pembersihan lingkungan di Desa Sumbergedang. Antusiasme warga sangat tinggi dalam menjaga kebersihan lingkungan.",
      source: "Instagram",
      source_url: "",
      author: "Kepala Desa",
      category: "berita",
      sentiment: "positif",
      urgency_level: 2,
      hoax_probability: 5,
      status: "selesai",
      created_at: new Date(Date.now() - 345600000).toISOString(),
      ai_analysis: null,
    },
  ];

  // Apply filters
  let filteredData = demoData;

  if (category && category !== "all") {
    filteredData = filteredData.filter((item) => item.category === category);
  }

  if (status && status !== "all") {
    filteredData = filteredData.filter((item) => item.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter(
      (item) =>
        item.content.toLowerCase().includes(searchLower) ||
        item.author.toLowerCase().includes(searchLower)
    );
  }

  // Apply pagination
  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
