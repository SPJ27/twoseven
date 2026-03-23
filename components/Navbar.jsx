"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Navbar({ user, darkmode, onDarkmodeChange }) {
  const [wsMenu, setWsMenu] = useState(false);
  const [trialDismissed, setTrialDismissed] = useState(false);

  function toggleDarkmode() {
    const next = !darkmode;
    try { localStorage.setItem("darkmode", String(next)); } catch {}
    onDarkmodeChange(next);
  }

  return (
    <div className={`sticky top-0 z-30 ${darkmode ? "bg-neutral-900" : "bg-neutral-50/40"}`}>
      {!trialDismissed && (
        <div className="bg-neutral-800 py-2.5 px-6 flex items-center justify-center gap-1.5 text-[13px] text-white relative">
          You have <strong>&nbsp;14 days&nbsp;</strong> left in your free trial
          —&nbsp;
          <a href="#" className="font-semibold underline underline-offset-2 hover:text-emerald-400 transition-colors">
            Pick a plan for $0
          </a>
          &nbsp;to keep analytics running without interruption
          <button
            onClick={() => setTrialDismissed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 bg-transparent border-none cursor-pointer text-lg leading-none p-1"
          >
            ×
          </button>
        </div>
      )}
      <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
        <button className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0">
          <Image src="/icon.png" alt="TwoSeven" width={30} height={30} />
          <Link
            href="/dashboard"
            className={`text-[15px] font-extrabold ${darkmode ? "text-white" : "text-neutral-800"} tracking-tight`}
          >
            TwoSeven
          </Link>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setWsMenu((v) => !v)}
              className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border transition-all ${
                darkmode
                  ? "border-neutral-700 bg-neutral-800"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[11px] font-extrabold text-white">
                {initials(user.name)}
              </div>
              <span className={`text-xs font-semibold ${darkmode ? "text-white" : "text-neutral-700"}`}>
                {user.name}
              </span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {wsMenu && (
              <div className={`absolute right-0 top-full mt-2 rounded-xl shadow-xl overflow-hidden min-w-[190px] z-50 border ${
                darkmode ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
              }`}>
                <div className="px-4 py-3">
                  <div className={`text-xs font-bold ${darkmode ? "text-white" : "text-neutral-800"}`}>
                    {user.name}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${darkmode ? "text-neutral-400" : "text-neutral-500"}`}>
                    {user.email}
                  </div>
                </div>
                <div>
                  <button
                    onClick={toggleDarkmode}
                    className={`block w-full text-left px-4 py-2.5 text-sm border-none cursor-pointer transition-colors ${
                      darkmode ? "text-white bg-transparent hover:bg-neutral-700" : "text-gray-700 bg-transparent hover:bg-gray-100"
                    }`}
                  >
                    {darkmode ? "☀ Light mode" : "☾ Dark mode"}
                  </button>
                  <Link
                    href="/logout"
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    Sign out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}