"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Settings from "@/components/settingsPage/Settings";

export default function SettingsDarkmodeProvider({ user, domain, id }) {
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

  // Avoid rendering until client has read localStorage to prevent flash
  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${darkmode ? "bg-neutral-900" : "bg-[#fbfaf9]"}`}>
      <Navbar user={user} darkmode={darkmode} onDarkmodeChange={handleDarkmodeChange} />
      <Settings user={user} domain={domain} id={id} darkmode={darkmode} />
    </div>
  );
}