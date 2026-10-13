import { NextRequest, NextResponse } from "next/server";

const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cardiotox-backend.onrender.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backendUrl = `${backendOrigin}/auth/google/callback?${searchParams.toString()}`;

  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      redirect: "manual",
    });

    // 1. Jika backend menolak (akun nonaktif / 401 / error status)
    if (!res.ok && res.status !== 302 && res.status !== 307) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url));
    }

    // 2. Jika backend merespon JSON yang berisi error
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      if (data && (data.error || data.detail)) {
        return NextResponse.redirect(new URL("/login?error=invalid", request.url));
      }
    }

    // 3. Jika backend mengembalikan redirect sukses (302/307)
    const location = res.headers.get("location");
    const redirectUrl = location ? new URL(location, request.url) : new URL("/login?login=success", request.url);

    const response = NextResponse.redirect(redirectUrl);

    // Teruskan set-cookie dari backend agar sesi tersimpan jika login sukses
    const setCookie = res.headers.getSetCookie?.() || [];
    if (setCookie.length > 0) {
      setCookie.forEach((cookieStr) => {
        response.headers.append("set-cookie", cookieStr);
      });
    } else {
      const rawCookie = res.headers.get("set-cookie");
      if (rawCookie) {
        response.headers.set("set-cookie", rawCookie);
      }
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }
}
