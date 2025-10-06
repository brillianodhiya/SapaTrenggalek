import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { name, kecamatan, category, content, email, phone } =
      await request.json();

    if (!name || !content) {
      return NextResponse.json(
        { error: "Nama dan aspirasi harus diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("aspirasi")
      .insert({
        name,
        kecamatan,
        category,
        content,
        email,
        phone,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan aspirasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aspirasi berhasil dikirim",
      data: data,
    });
  } catch (error) {
    console.error("Error creating aspirasi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan aspirasi" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const kecamatan = searchParams.get("kecamatan");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin.from("aspirasi").select(
      `
        id, name, kecamatan, category, content, email, phone, status, 
        created_at, updated_at, admin_response, admin_id
      `,
      { count: "exact" }
    );

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (kecamatan) {
      query = query.eq("kecamatan", kecamatan);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data aspirasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching aspirasi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data aspirasi" },
      { status: 500 }
    );
  }
}
