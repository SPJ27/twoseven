"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AnalyticsComponents from "@/components/analytics/main";

export default function DarkmodeProvider({ user, trackerId, userEmail }) {
  const [darkmode, setDarkmode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("darkmode");
      if (stored === "true") setDarkmode(true);
    } catch {}
    setMounted(true);
  }, []);

  function handleDarkmodeChange(val) {
    try { localStorage.setItem("darkmode", String(val)); } catch {}
    setDarkmode(val);
  }

  if (!mounted) return null;

  return (
    <div>
      <Navbar user={user} darkmode={darkmode} onDarkmodeChange={handleDarkmodeChange} />
      <AnalyticsComponents TRACKER_ID={trackerId} user_email={userEmail} darkmode={darkmode} />
    </div>
  );
}