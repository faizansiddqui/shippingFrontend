"use client";

// Default to proxying through Next.js API routes so cookies are handled
// by the frontend host. Override with NEXT_PUBLIC_API_BASE_URL to call
// the backend directly when needed.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";