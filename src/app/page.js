"use client";

import React from "react";
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

  if (loading) return <Loader />;

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
