import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { status, admin_response, admin_id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID aspirasi tidak valid" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (admin_response) {
      updateData.admin_response = admin_response;
    }

    if (admin_id) {
      updateData.admin_id = admin_id;
    }

    const { data, error } = await supabaseAdmin
      .from("aspirasi")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Aspirasi tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Gagal memperbarui aspirasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aspirasi berhasil diperbarui",
      data: data,
    });
  } catch (error) {
    console.error("Error updating aspirasi:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui aspirasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id) {
      return NextResponse.json(
        { error: "ID aspirasi tidak valid" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("aspirasi")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Aspirasi tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Gagal menghapus aspirasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aspirasi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting aspirasi:", error);
    return NextResponse.json(
      { error: "Gagal menghapus aspirasi" },
      { status: 500 }
    );
  }
}
