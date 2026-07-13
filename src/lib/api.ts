// src/lib/api.ts

// Gunakan proxy same-origin Next.js supaya cookie sesi tersimpan untuk domain frontend
const BASE = "/api"; 

interface ApiOptions {
  method?: string;
  body?: unknown; // Mengganti 'any' untuk menyelesaikan error ESLint
}

export async function api(path: string, { method = "GET", body }: ApiOptions = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include", // Tetap WAJIB ada
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}