import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { password } = await req.json();
    const correctPassword =
      process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { success: false, message: "ADMIN_PASSWORD belum dikonfigurasi di environment (.env)." },
        { status: 500 }
      );
    }

    if (password && password === correctPassword) {
      return NextResponse.json({ success: true, message: "Autentikasi berhasil" });
    }

    return NextResponse.json(
      { success: false, message: "Password salah! Silakan coba lagi." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
