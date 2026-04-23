"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/checkAuth";
import Loader from "./components/Loader";
import Enquery from "./components/Enquery";
import Ship from "./components/Ship";
import TrustedBy from "./components/TrsutedBy";
import HeroSection from "./components/Hero";
import AnalyticsSection from "./components/AnalyticsSection";
import WhyChoose from "./components/WhyChoose";

export default function Page() {
  const { user, loading } = useAuth(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If already authenticated, send user to dashboard
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <Loader />;

  // If user exists we keep returning null because router.replace will navigate
  if (user) return null;

  return (
    <>
      <HeroSection />
      <TrustedBy />
      <AnalyticsSection />
      <WhyChoose />
      <Ship />
      <Enquery />
    </>
  );
}
