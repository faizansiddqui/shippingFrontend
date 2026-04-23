"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/utils/api";

const AuthCallback = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const next = (searchParams && searchParams.get("next")) || "/dashboard";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem(
            "refreshExpires",
            Date.now() + 15 * 24 * 60 * 60 * 1000,
          );
          router.push(next);
        } else {
          const current = encodeURIComponent(
            window.location.pathname +
              (window.location.search || "") +
              (window.location.hash || ""),
          );
          router.push(`/login?next=${current}`);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        const current = encodeURIComponent(
          window.location.pathname +
            (window.location.search || "") +
            (window.location.hash || ""),
        );
        router.push(`/login?next=${current}`);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="h-screen flex justify-center items-center">
      <p>Loading...</p>
    </div>
  );
};

export default AuthCallback;
