"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaPaperclip,
  FaShieldAlt,
  FaChartBar,
  FaGlobe,
  FaBell,
} from "react-icons/fa";

// ─── Sparkline ───────────────────────────────────────────────
function Sparkline() {
  const data = [
    65, 58, 62, 50, 54, 45, 48, 38, 42, 33, 36, 28, 31, 22, 27, 18, 24, 15, 20,
    12, 16, 9, 13, 6, 10, 4, 8, 3, 6, 2,
  ];
  const W = 600,
    H = 80,
    P = 2;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = P + (i / (data.length - 1)) * (W - P * 2);
    const y = H - P - ((max - v) / max) * (H - P * 2);
    return [x, y];
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 80 }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path
        d={line}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── LiveDot ─────────────────────────────────────────────────
function LiveDot({ size = "sm" }) {
  const s = size === "lg" ? "w-3 h-3" : "w-2 h-2";
  return (
    <span className="relative inline-flex flex-shrink-0">
      <span className={`${s} rounded-full bg-emerald-500 inline-block`} />
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50`}
      />
    </span>
  );
}

// ─── Badge ───────────────────────────────────────────────────
function Badge({ children }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
      <LiveDot />
      {children}
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────
function StatCard({ label, value, trend, up }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">
        {value}
      </div>
      <div
        className={`mt-1 text-xs font-bold rounded-full inline-flex items-center gap-1 px-2 py-0.5 border
        ${up ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-red-500 bg-red-50 border-red-200"}`}
      >
        {up ? "↑" : "↓"} {trend}
      </div>
    </div>
  );
}
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-6 hover:shadow-lg hover:shadow-neutral-200 hover:border-neutral-100 transition-all duration-200 group">
      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 text-lg group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <div className="font-bold text-neutral-900 mb-1.5">{title}</div>
      <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── TestimonialCard ─────────────────────────────────────────
function TestimonialCard({ quote, name, role, initial }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
      <p className="text-sm text-neutral-700 leading-relaxed mb-4">"{quote}"</p>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-extrabold text-emerald-700 flex-shrink-0">
          {initial}
        </div>
        <div>
          <div className="text-xs font-bold text-neutral-800">{name}</div>
          <div className="text-[11px] text-neutral-400">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── PricingCard ─────────────────────────────────────────────
function PricingCard({ plan, price, sub, features, cta, highlight }) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col gap-4 relative
      ${highlight ? "border-2 border-neutral-900 bg-neutral-900" : "border border-neutral-200 bg-white"}`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500 text-white whitespace-nowrap">
          Most popular
        </div>
      )}
      <div>
        <div
          className={`text-sm font-bold mb-1 ${highlight ? "text-neutral-400" : "text-neutral-500"}`}
        >
          {plan}
        </div>
        <div
          className={`text-3xl font-extrabold ${highlight ? "text-white" : "text-neutral-900"}`}
        >
          {price}
          {sub && (
            <span className="text-base font-semibold text-neutral-400">
              {sub}
            </span>
          )}
        </div>
        <div
          className={`text-xs ${highlight ? "text-neutral-500" : "text-neutral-400"}`}
        >
          {price === "$0" ? "forever free" : "billed monthly"}
        </div>
      </div>
      <ul className="flex flex-col gap-2 flex-1">
        {features.map((f, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-sm ${highlight ? "text-neutral-300" : "text-neutral-600"}`}
          >
            <span
              className={
                f.included
                  ? highlight
                    ? "text-emerald-400 font-bold"
                    : "text-emerald-500 font-bold"
                  : "text-neutral-300 font-bold"
              }
            >
              {f.included ? "✓" : "✗"}
            </span>
            <span
              className={
                !f.included
                  ? highlight
                    ? "text-neutral-500"
                    : "text-neutral-400"
                  : ""
              }
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="#"
        className={`inline-flex items-center justify-center text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95
          ${
            highlight
              ? "bg-emerald-500 text-white hover:bg-emerald-400"
              : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
          }`}
      >
        {cta}
      </Link>
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 h-14 transition-all duration-200
      ${scrolled ? "bg-neutral-50/90 backdrop-blur border-b border-neutral-200 shadow-sm shadow-neutral-900/5" : "bg-transparent"}`}
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-extrabold text-[15px] tracking-tight text-neutral-900"
      >
        <LiveDot />
        TwoSeven
      </Link>
      <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
        {[
          ["Features", "#features"],
          ["How it works", "#how-it-works"],
          ["Pricing", "#pricing"],
        ].map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-[13px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors no-underline"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className="text-[13px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors hidden sm:inline"
        >
          Log in
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-all active:scale-95"
        >
          Get started →
        </Link>
      </div>
    </nav>
  );
}

// ─── Page (default export) ───────────────────────────────────
export default function page() {
  return (
    <div
      className="bg-neutral-50 text-neutral-800 antialiased overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .fade-1 { animation: fadeUp .55s ease both; }
        .fade-2 { animation: fadeUp .55s .1s ease both; }
        .fade-3 { animation: fadeUp .55s .22s ease both; }
        .fade-4 { animation: fadeUp .55s .34s ease both; }
        .fade-5 { animation: fadeUp .55s .48s ease both; }
      `}</style>

      <Nav />

      <section className="pt-32 pb-24 px-6 md:px-10 max-w-5xl mx-auto">
        <div className="flex flex-col items-start gap-6">
          <div className="fade-1">
            <Badge>Now tracking 12,400+ websites</Badge>
          </div>
          <h1 className="fade-2 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-neutral-900 max-w-3xl m-0">
            Analytics that
            <br />
            <span className="text-emerald-500">don't get in the way.</span>
          </h1>
          <p className="fade-3 text-base md:text-lg text-neutral-500 max-w-xl leading-relaxed m-0">
            One script. No cookies. No GDPR banners. Just clean, real-time
            visitor data — presented the way founders actually think.
          </p>
          <div className="fade-4 flex items-center gap-3 flex-wrap">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 transition-all active:scale-95 shadow-lg shadow-neutral-900/10"
            >
              Add your website free →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 transition-all active:scale-95"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="fade-5 mt-16">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300 flex-shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 flex-shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 flex-shrink-0" />
              <span
                className="ml-3 text-xs text-neutral-400 bg-white border border-neutral-200 rounded-md px-3 py-0.5 truncate"
                style={{ fontFamily: "'DM Mono', monospace" }}
              ></span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Visitors today" value="2,841" trend="12%" up />
              <StatCard label="Pageviews" value="9.4K" trend="8%" up />
              <StatCard label="Bounce rate" value="38%" trend="3%" up={false} />

              <div className="md:col-span-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                  Visitors — Last 30 days
                </div>
                <Sparkline />
              </div>

              <div className="md:col-span-2 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                  Top Pages
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    { path: "/products", pct: 78, count: "2,210" },
                    { path: "/", pct: 55, count: "1,540" },
                    { path: "/blog", pct: 38, count: "1,080" },
                    { path: "/pricing", pct: 20, count: "560" },
                  ].map((row) => (
                    <div
                      key={row.path}
                      className="flex items-center justify-between"
                    >
                      <span
                        className="text-xs text-neutral-600"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {row.path}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="font-bold tabular-nums text-neutral-800 text-xs w-10 text-right">
                          {row.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                  Top Sources
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    ["Google", "48%"],
                    ["Direct", "27%"],
                    ["Twitter / X", "14%"],
                    ["Hacker News", "11%"],
                  ].map(([src, pct]) => (
                    <div
                      key={src}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-neutral-700">
                        {src}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">
                        {pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 md:px-10 max-w-5xl mx-auto">
        <div className="mb-14">
          <Badge>Features</Badge>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight max-w-lg">
            Everything you need. Nothing you don't.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<FaPaperclip />}
            title="Real-time visitors"
            desc="See who's on your site right now — live counters, active pages, and session maps, without any delay."
          />
          <FeatureCard
            icon={<FaShieldAlt />}
            title="Cookie-free, GDPR-ready"
            desc="No cookies, no fingerprinting, no consent banners. Compliant by default in EU, UK, and beyond."
          />
          <FeatureCard
            icon={<FaPaperclip />}
            title="One script install"
            desc="Drop a single <script> tag and you're live in under 60 seconds. Works with any stack — Next.js, WordPress, Webflow."
          />
          <FeatureCard
            icon={<FaChartBar />}
            title="Beautiful dashboards"
            desc="Clean sparklines, top pages, referrers, and device breakdowns in a single scrollable view that loads instantly."
          />
          <FeatureCard
            icon={<FaGlobe />}
            title="Unlimited websites"
            desc="Manage all your projects under one account. Switch between sites in two clicks with full isolation of data."
          />
          <FeatureCard
            icon={<FaBell />}
            title="Spike alerts"
            desc="Get notified when a post blows up, a campaign lands, or traffic drops — before your boss asks about it."
          />
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-24 px-6 md:px-10 bg-white border-y border-neutral-200"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <Badge>How it works</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Up in three steps. Seriously.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-bold text-neutral-900 mb-1">
                  Add your website
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed m-0">
                  Enter your domain and get a unique tracker ID. No credit card
                  required to start.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-bold text-neutral-900 mb-1">
                  Paste the snippet
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed m-0">
                  Copy the generated script tag and add it before &lt;/head&gt;
                  — that's the entire installation.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-bold text-neutral-900 mb-1">
                  Watch data flow in
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed m-0">
                  Your dashboard goes live after the first page view. No config,
                  no tagging plan, no analyst needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 
      <section id="pricing" className="py-24 px-6 md:px-10 max-w-5xl mx-auto">
        <div className="mb-14 text-center">
          <Badge>Pricing</Badge>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Simple. Honest. No surprises.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {/* <PricingCard
            plan="Hobby" price="$0" cta="Start free"
            features={[
              { label: "3 websites", included: true },
              { label: "10K pageviews/mo", included: true },
              { label: "30-day history", included: true },
              { label: "Spike alerts", included: false },
            ]}
          />
          <PricingCard
            plan="Pro" price="$9" sub="/mo" cta="Get Pro →" highlight
            features={[
              { label: "Unlimited websites", included: true },
              { label: "1M pageviews/mo", included: true },
              { label: "12-month history", included: true },
              { label: "Spike alerts", included: true },
            ]}
          />
          <PricingCard
            plan="Team" price="$29" sub="/mo" cta="Get Team"
            features={[
              { label: "Everything in Pro", included: true },
              { label: "5 team members", included: true },
              { label: "Unlimited history", included: true },
              { label: "Priority support", included: true },
            ]}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
            Coming soon
          </div>
        </div>
      </section> */}
      <section className="py-24 px-6 md:px-10 bg-white border-t border-neutral-200">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          <TestimonialCard
            quote="Switched from GA and never looked back. The dashboard actually loads, and I can share it with clients without teaching them anything."
            name="Jamie R."
            role="Indie maker"
            initial="J"
          />
          <TestimonialCard
            quote="Got it live in literally 2 minutes on our Webflow site. No cookies, no GDPR popups — our legal team is happy."
            name="Sara M."
            role="Head of Growth, SaaS"
            initial="S"
          />
          <TestimonialCard
            quote="The spike alerts are the killer feature. Found out about a viral Reddit post 8 minutes after it happened — server didn't even go down."
            name="Tom K."
            role="Solo founder"
            initial="T"
          />
        </div>
      </section>

      <section className="py-28 px-6 md:px-10">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <LiveDot size="lg" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight m-0">
            Start tracking in 60 seconds.
          </h2>
          <p className="text-base text-neutral-500 m-0">
            No credit card. No setup call. Just your domain and a script tag.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-all active:scale-95 shadow-xl shadow-neutral-900/10"
          >
            Add your first website free →
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white px-6 md:px-10 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-extrabold text-sm text-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
            TwoSeven
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Twitter", "GitHub"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="text-xs text-neutral-400">© 2026 TwoSeven</div>
        </div>
      </footer>
    </div>
  );
}
