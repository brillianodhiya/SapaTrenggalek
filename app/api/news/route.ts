import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const sentiment = searchParams.get("sentiment");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin.from("data_entries").select(
      `
        id, content, source, category, sentiment, urgency_level, 
        hoax_probability, status, author, created_at, source_url,
        image_url, image_alt, image_caption
      `,
      { count: "exact" }
    );

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (sentiment) {
      query = query.eq("sentiment", sentiment);
    }

    if (search) {
      query = query.or(`content.ilike.%${search}%,source.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data berita" },
        { status: 500 }
      );
    }

    // Add excerpt to data
    const dataWithExcerpt =
      data?.map((item) => ({
        ...item,
        excerpt:
          item.content && item.content.length > 200
            ? item.content.substring(0, 200) + "..."
            : item.content,
      })) || [];

    // Get categories for filter
    const { data: categoriesData } = await supabaseAdmin
      .from("data_entries")
      .select("category")
      .not("category", "is", null);

    const categories = [
      ...new Set(categoriesData?.map((item) => item.category) || []),
    ].sort();

    return NextResponse.json({
      success: true,
      data: dataWithExcerpt,
      categories,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data berita" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID berita harus diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select(
        `
        id, content, source, category, sentiment, urgency_level, 
        hoax_probability, status, author, created_at, source_url,
        image_url, image_alt, image_caption
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching news detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail berita" },
      { status: 500 }
    );
  }
}
