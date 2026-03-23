"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardDarkmodeProvider({ projects, user }) {
  const [darkmode, setDarkmode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("darkmode") === "true") setDarkmode(true);
    } catch {}
    setMounted(true);
  }, []);

  function handleDarkmodeChange(val) {
    try { localStorage.setItem("darkmode", String(val)); } catch {}
    setDarkmode(val);
  }

  if (!mounted) return null;

  return (
    <Dashboard
      projects={projects}
      user={user}
      darkmode={darkmode}
      onDarkmodeChange={handleDarkmodeChange}
    />
  );
}