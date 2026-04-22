"use client";

// Prefer proxying through Next.js API routes so cookies are handled
// by the frontend host. To bypass the proxy and call the backend directly,
// set NEXT_PUBLIC_BYPASS_PROXY=true and NEXT_PUBLIC_API_BASE_URL.
const bypassProxy = process.env.NEXT_PUBLIC_BYPASS_PROXY === "true";
export const API_BASE_URL = bypassProxy
  ? (process.env.NEXT_PUBLIC_API_BASE_URL || "/api")
  : "/api";