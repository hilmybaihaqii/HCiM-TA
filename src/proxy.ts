import { NextResponse, type NextRequest } from "next/server";
import { SESSION_FLAG } from "@/lib/sessionFlag";

// Selama user masih login, halaman publik dan halaman login/daftar tidak bisa dibuka (termasuk lewat
// URL yang diketik manual): user diarahkan kembali ke /lab sampai ia benar-benar logout.
// /reset-password tidak ditahan, supaya link reset dari email tetap bisa dipakai.
export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_FLAG)?.value === "1") {
    return NextResponse.redirect(new URL("/lab", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/aboutus",
    "/articles/:path*",
    "/standards/:path*",
  ],
};
