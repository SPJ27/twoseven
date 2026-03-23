"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import {
  FaCrown,
  FaFacebook,
  FaLink,
  FaGithub,
  FaYoutube,
  FaLinkedin,
  FaReddit,
  FaInstagram,
  FaMobile,
  FaTablet,
  FaDesktop,
  FaUser,
  FaEnvelope,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaPaperclip,
  FaMapMarker,
  FaShieldAlt,
  FaUserSlash,
  FaChevronDown,
} from "react-icons/fa";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Icon } from "@iconify/react";
Chart.register(...registerables);

const API_BASE = "/api/stats";

const P = {
  primary: "#06AB78",
  primaryLight: "#08C98D",
  primaryDim: "rgba(6,171,120,0.15)",
  primaryFaint: "rgba(6,171,120,0.07)",
  base: "#30313D",
  baseMid: "#3E3F4D",
  baseSoft: "#555668",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8F9",
  border: "#E4E5ED",
  textMain: "#30313D",
  textSub: "#6B6D80",
  textFaint: "#9B9DAF",
};

function getDateRange(period) {
  const today = new Date().toISOString().split("T")[0];
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
  switch (period) {
    case "Today": return { fromDate: today, toDate: today };
    case "Yesterday": return { fromDate: daysAgo(1), toDate: daysAgo(1) };
    case "Last 7 days": return { fromDate: daysAgo(7), toDate: today };
    case "Last 30 days": return { fromDate: daysAgo(30), toDate: today };
    case "All time": return { fromDate: null, toDate: null };
    default: return { fromDate: daysAgo(7), toDate: today };
  }
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PERIODS = ["Today","Yesterday","Last 7 days","Last 30 days","All time","Custom range"];

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtTime(secs) {
  const s = Math.round(Number(secs) || 0);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function topEntries(obj = {}) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function getFlag(c) {
  return <span className={`fi fi-${c || "xx"}`} />;
}

const iconStyle = { color: P.baseSoft };

function getReferrerIcon(r) {
  if (!r || r === "Direct") return <FaLink style={iconStyle} />;
  if (/google/i.test(r)) return <FcGoogle />;
  if (/twitter|x\.com/i.test(r)) return <Icon icon="devicon:twitter" width="15" height="15" />;
  if (/facebook/i.test(r)) return <FaFacebook style={{ color: "#1877F2" }} />;
  if (/github/i.test(r)) return <FaGithub style={iconStyle} />;
  if (/youtube/i.test(r)) return <FaYoutube style={{ color: "#FF0000" }} />;
  if (/linkedin/i.test(r)) return <FaLinkedin style={iconStyle} />;
  if (/reddit/i.test(r)) return <FaReddit style={{ color: "#FF4500" }} />;
  if (/instagram/i.test(r)) return <FaInstagram style={{ color: "#E1306C" }} />;
  return <FaLink style={iconStyle} />;
}
function getDeviceIcon(d) {
  return d === "Mobile" ? <FaMobile style={iconStyle} /> : d === "Tablet" ? <FaTablet style={iconStyle} /> : <FaDesktop style={iconStyle} />;
}
function getBrowserIcon(b) {
  if (/chrome/i.test(b)) return <Icon icon="logos:chrome" width="15" height="15" />;
  if (/firefox/i.test(b)) return <Icon icon="logos:firefox" width="15" height="15" />;
  if (/safari/i.test(b)) return <Icon icon="logos:safari" width="15" height="15" />;
  if (/edge/i.test(b)) return <Icon icon="logos:microsoft-edge" width="15" height="15" />;
  if (/arc/i.test(b)) return <Icon icon="logos:arc" width="15" height="15" />;
  if (/opera/i.test(b)) return <Icon icon="logos:opera" width="15" height="15" />;
  return <FaLink style={iconStyle} />;
}
function getOSIcon(o) {
  if (/windows/i.test(o)) return <Icon icon="devicon:windows8" width="15" height="15" />;
  if (/macos/i.test(o)) return <Icon icon="wpf:macos" width="15" height="15" />;
  if (/linux/i.test(o)) return <Icon icon="devicon:linux" width="15" height="15" />;
  if (/android/i.test(o)) return <Icon icon="devicon:android" width="15" height="15" />;
  if (/ios/i.test(o)) return <Icon icon="f7:logo-ios" width="15" height="15" />;
  return <FaLink style={iconStyle} />;
}

function getLeftRows(data, tab) {
  if (!data) return [];
  const maps = {
    Referrer: [data.referrers, getReferrerIcon],
    Device: [data.devices, getDeviceIcon],
    Browser: [data.browsers, getBrowserIcon],
    OS: [data.oses, getOSIcon],
  };
  const [obj, iconFn] = maps[tab] || [];
  if (!obj) return [];
  return topEntries(obj).map(([k, v]) => ({ label: k, value: v, icon: iconFn(k) }));
}

function getRightRows(data, tab) {
  if (!data) return [];
  const maps = {
    Country: [data.countries, (k) => getFlag(data.country_codes[k])],
    City: [data.cities, () => <FaMapMarker style={iconStyle} />],
    Page: [data.visitedPages, () => <FaPaperclip style={iconStyle} />],
  };
  const [obj, iconFn] = maps[tab] || [];
  if (!obj) return [];
  return topEntries(obj).map(([k, v]) => ({ label: k, value: v, icon: iconFn(k) }));
}

function CalendarMonth({ year, month, rangeStart, rangeEnd, hovered, onDayClick, onDayHover }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dayState(d) {
    if (!d) return "empty";
    const iso = isoDate(new Date(year, month, d));
    const effectiveEnd = rangeEnd || hovered;
    const lo = rangeStart && effectiveEnd ? (rangeStart < effectiveEnd ? rangeStart : effectiveEnd) : rangeStart;
    const hi = rangeStart && effectiveEnd ? (rangeStart < effectiveEnd ? effectiveEnd : rangeStart) : rangeStart;
    if (iso === lo && iso === hi) return "start-only";
    if (iso === lo) return "start";
    if (iso === hi) return "end";
    if (iso === rangeStart && !effectiveEnd) return "start-only";
    if (lo && hi && iso > lo && iso < hi) return "in-range";
    return "default";
  }

  const today = isoDate(new Date());

  return (
    <div className="min-w-[210px]">
      <div className="text-center text-[13px] font-bold text-[#30313D] mb-2.5">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-[#9B9DAF] py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = isoDate(new Date(year, month, d));
          const state = dayState(d);
          const isToday = iso === today;
          const isFuture = iso > today;
          const bgClass = { start: "bg-[#06AB78]", end: "bg-[#06AB78]", "start-only": "bg-[#06AB78]", "in-range": "bg-[rgba(6,171,120,0.15)]", default: "bg-transparent" }[state] ?? "bg-transparent";
          const textClass = { start: "text-white", end: "text-white", "start-only": "text-white", "in-range": "text-[#06AB78]", default: isFuture ? "text-[#9B9DAF]" : "text-[#30313D]" }[state] ?? "text-[#30313D]";
          return (
            <div
              key={i}
              onClick={() => !isFuture && onDayClick(iso)}
              onMouseEnter={() => !isFuture && onDayHover(iso)}
              onMouseLeave={() => onDayHover(null)}
              className={[
                "text-center text-xs py-[5px] rounded-md transition-colors",
                state !== "default" ? "font-bold" : "font-normal",
                isFuture ? "opacity-35 cursor-default" : "cursor-pointer hover:bg-[rgba(6,171,120,0.07)]",
                bgClass, textClass,
                isToday && state === "default" ? "outline outline-[1.5px] outline-[#06AB78]" : "",
              ].join(" ")}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomRangePicker({ onApply, onCancel, initialFrom, initialTo }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(initialFrom || null);
  const [rangeEnd, setRangeEnd] = useState(initialTo || null);
  const [hovered, setHovered] = useState(null);

  const left = { y: viewYear, m: viewMonth };
  const right = viewMonth === 11 ? { y: viewYear + 1, m: 0 } : { y: viewYear, m: viewMonth + 1 };

  function handleDayClick(iso) {
    if (!rangeStart || (rangeStart && rangeEnd)) { setRangeStart(iso); setRangeEnd(null); }
    else { if (iso < rangeStart) { setRangeEnd(rangeStart); setRangeStart(iso); } else { setRangeEnd(iso); } }
  }

  function nav(dir) {
    if (dir === -1) { if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1); }
    else { if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1); }
  }

  const canApply = rangeStart && rangeEnd;
  const fmt = (iso) => iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="absolute top-[calc(100%+6px)] left-0 z-[100] bg-white border border-[#E4E5ED] rounded-2xl p-5 shadow-[0_12px_32px_rgba(48,49,61,0.14)]">
      <div className="flex items-center justify-between mb-3.5">
        <button onClick={() => nav(-1)} className="border border-[#E4E5ED] bg-transparent cursor-pointer text-[#6B6D80] text-sm px-2.5 py-0.5 rounded-lg hover:border-[#06AB78]">‹</button>
        <button onClick={() => nav(1)} className="border border-[#E4E5ED] bg-transparent cursor-pointer text-[#6B6D80] text-sm px-2.5 py-0.5 rounded-lg hover:border-[#06AB78]">›</button>
      </div>
      <div className="flex gap-6">
        <CalendarMonth year={left.y} month={left.m} rangeStart={rangeStart} rangeEnd={rangeEnd} hovered={hovered} onDayClick={handleDayClick} onDayHover={setHovered} />
        <div className="w-px bg-[#E4E5ED]" />
        <CalendarMonth year={right.y} month={right.m} rangeStart={rangeStart} rangeEnd={rangeEnd} hovered={hovered} onDayClick={handleDayClick} onDayHover={setHovered} />
      </div>
      <div className="mt-3.5 pt-3.5 border-t border-[#E4E5ED] flex items-center justify-between gap-3">
        <div className="text-xs text-[#6B6D80] flex-1">
          {rangeStart ? (
            <>
              <span className="font-semibold text-[#30313D]">{fmt(rangeStart)}</span>
              {" → "}
              <span className={`font-semibold ${rangeEnd ? "text-[#30313D]" : "text-[#9B9DAF]"}`}>
                {rangeEnd ? fmt(rangeEnd) : "pick end date"}
              </span>
            </>
          ) : (
            <span className="text-[#9B9DAF]">Select a start date</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#E4E5ED] bg-transparent text-[#6B6D80] cursor-pointer hover:border-[#06AB78]">Cancel</button>
          <button onClick={() => canApply && onApply(rangeStart, rangeEnd)} disabled={!canApply} className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border-none transition-colors ${canApply ? "bg-[#06AB78] text-white cursor-pointer" : "bg-[rgba(6,171,120,0.15)] text-[#9B9DAF] cursor-default"}`}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function NotConnectedBadge({ connected }) {
  if (connected === true) return null;
  return (
    <div className="fixed bottom-5 bg-yellow-100 left-5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-400 shadow-sm text-xs font-medium text-[#6B6D80] select-none pointer-events-none">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      Not connected
    </div>
  );
}

function Avatar({ name, darkmode = false }) {
  if (!name) {
    return <FaUser className={`${darkmode ? "text-white" : "text-[#6B6D80]"}`} style={{ fontSize: 16 }} />;
  }
  const initials = (name || "Anonymous").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${darkmode ? "bg-neutral-700 text-white" : "bg-neutral-300 text-[#30313D]"}`}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, trend, up, darkmode }) {
  return (
    <div className={`rounded-lg border max-w-40 p-4 ${darkmode ? "border-neutral-900 bg-neutral-900" : "border-neutral-300/90 bg-neutral-50/40"}`}>
      <div className={`text-xs font-medium tracking-wide mb-1 ${darkmode ? "text-neutral-500" : "text-neutral-400"}`}>{label}</div>
      <div className={`text-2xl font-extrabold tabular-nums ${darkmode ? "text-neutral-100" : "text-neutral-800"}`}>{value}</div>
      <div className={`mt-1 text-xs font-bold rounded-full inline-flex items-center gap-1 px-2 py-0.5 border ${up ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-red-500 bg-red-50 border-red-200"}`}>
        {up ? "↑" : "↓"} {trend}%
      </div>
    </div>
  );
}

function PeriodDropdown({ value, onChange, customLabel, onCustomClick, darkmode }) {
  const [open, setOpen] = useState(false);
  const displayLabel = value === "Custom range" && customLabel ? customLabel : value;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-colors max-w-60 ${
          darkmode ? "text-white bg-neutral-800 border-neutral-700 hover:bg-neutral-700" : "text-[#30313D] bg-white border-[#E4E5ED] hover:bg-neutral-50/40"
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <span className="text-[#9B9DAF] ml-0.5 text-[10px] shrink-0">▾</span>
      </button>
      {open && (
        <div className={`absolute top-[calc(100%+4px)] left-0 z-50 border rounded-lg overflow-hidden shadow-[0_8px_24px_rgba(48,49,61,0.12)] min-w-[160px] ${
          darkmode ? "bg-neutral-800 border-neutral-700" : "bg-white border-[#E4E5ED]"
        }`}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => { if (p === "Custom range") { setOpen(false); onCustomClick(); } else { onChange(p); setOpen(false); } }}
              className={`w-full text-left px-4 py-1.5 text-[13px] cursor-pointer border-none flex items-center gap-2 transition-colors hover:bg-[rgba(6,171,120,0.07)] ${
                p === value
                  ? "bg-[rgba(6,171,120,0.07)] text-[#06AB78] font-semibold"
                  : darkmode ? "bg-transparent text-neutral-200 font-normal" : "bg-transparent text-[#30313D] font-normal"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 border-[3px] border-[rgba(6,171,120,0.15)] border-t-[#06AB78] rounded-full animate-spin" />
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-[#FFCDD2] bg-[#FFF5F5] px-4 py-3 flex justify-between items-center">
      <span className="text-[13px] text-[#C62828]">{message}</span>
      <button onClick={onRetry} className="text-xs text-[#C62828] bg-none border-none cursor-pointer underline">Retry</button>
    </div>
  );
}

function buildChartGradient(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, "rgba(6,171,120,0.28)");
  grad.addColorStop(0.6, "rgba(6,171,120,0.06)");
  grad.addColorStop(1, "rgba(6,171,120,0.0)");
  return grad;
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#30313D", borderColor: "#3E3F4D", borderWidth: 1,
      titleColor: "#9B9DAF", bodyColor: "#fff", padding: 10,
      callbacks: { label: (c) => ` ${c.parsed.y} visitors` },
    },
  },
  scales: {
    x: { grid: { color: "rgba(48,49,61,0.05)", drawBorder: false }, ticks: { color: "#9B9DAF", font: { size: 11 }, maxRotation: 0, maxTicksLimit: 10 }, border: { display: false } },
    y: { min: 0, grid: { color: "rgba(48,49,61,0.05)", drawBorder: false }, ticks: { color: "#9B9DAF", font: { size: 11 }, stepSize: 1 }, border: { display: false } },
  },
};

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <FaSort className="text-[#9B9DAF] ml-1 inline" />;
  return sortDir === "asc" ? <FaSortUp className="text-[#06AB78] ml-1 inline" /> : <FaSortDown className="text-[#06AB78] ml-1 inline" />;
}

function UserSettingsDropdown({ user, onAdminChange, tracker_id, darkmode = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleAdminToggle(makeAdmin, email, tracker_id) {
    setLoading(true);
    setOpen(false);
    try {
      await fetch(`/api/admin?trackerId=${tracker_id}&email=${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin: makeAdmin }),
      });
      onAdminChange(user.id, makeAdmin);
    } catch (err) {
      console.error("Failed to update admin status", err);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = !!user.admin;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={`flex items-center gap-1 text-[11px] font-semibold rounded-full border px-2 py-0.5 transition-colors cursor-pointer select-none ${
          isAdmin
            ? "text-[#06AB78] bg-[rgba(6,171,120,0.08)] border-[rgba(6,171,120,0.25)] hover:bg-[rgba(6,171,120,0.15)]"
            : "text-[#9B9DAF] bg-[rgba(155,157,175,0.07)] border-[rgba(155,157,175,0.15)] hover:border-[#06AB78] hover:text-[#06AB78]"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : isAdmin ? <FaShieldAlt className="text-[9px]" /> : <FaUser className="text-[9px]" />}
        <span>{isAdmin ? "Admin" : "User"}</span>
        <FaChevronDown className="text-[7px] opacity-60" />
      </button>

      {open && (
        <div className={`absolute right-0 top-[calc(100%+4px)] z-50 border rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(48,49,61,0.18)] min-w-[180px] ${
          darkmode ? "bg-neutral-800 border-neutral-700" : "bg-white border-[#E4E5ED]"
        }`}>
          <div className={`px-3 py-2 border-b ${darkmode ? "border-neutral-700 bg-neutral-900" : "border-[#E4E5ED] bg-[#F7F8F9]"}`}>
            <p className="text-[10px] font-bold text-[#9B9DAF] uppercase tracking-[0.06em]">Access level</p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => handleAdminToggle(true, user.email, tracker_id)}
              className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 border-none transition-colors cursor-pointer ${
                darkmode ? "bg-neutral-800 hover:bg-[rgba(6,171,120,0.12)]" : "bg-white hover:bg-[rgba(6,171,120,0.07)]"
              }`}
            >
              <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(6,171,120,0.08)]">
                <FaShieldAlt className="text-[10px] text-[#06AB78]" />
              </div>
              <div>
                <p className={`text-[12px] font-semibold leading-tight ${darkmode ? "text-white" : "text-[#30313D]"}`}>Add admin access</p>
                <p className="text-[10px] text-[#9B9DAF] mt-0.5 leading-snug">Full dashboard & user management</p>
              </div>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleAdminToggle(false, user.email, tracker_id)}
              className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 border-none border-t transition-colors cursor-pointer ${
                darkmode ? "bg-neutral-800 border-neutral-700 hover:bg-[rgba(198,40,40,0.12)]" : "bg-white border-[#E4E5ED] hover:bg-[#FFF5F5]"
              }`}
            >
              <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(198,40,40,0.08)]">
                <FaUserSlash className="text-[10px] text-[#C62828]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-tight text-[#C62828]">Remove admin access</p>
                <p className="text-[10px] text-[#9B9DAF] mt-0.5 leading-snug">Reverts to standard user role</p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UsersTable({ users: initialUsers = [], creator, tracker_id, countryCodes, darkmode = false }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("lastSeen");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

  function handleAdminChange(userId, isAdmin) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, admin: isAdmin } : u)));
  }

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(0);
  }

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.userId?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let av = a[sortCol] ?? "", bv = b[sortCol] ?? "";
      if (sortCol === "visits") { av = Number(av) || 0; bv = Number(bv) || 0; }
      else if (sortCol === "lastSeen" || sortCol === "dateCreated") { av = new Date(av).getTime() || 0; bv = new Date(bv).getTime() || 0; }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const border = darkmode ? "border-neutral-700" : "border-[#E4E5ED]";
  const textPrimary = darkmode ? "text-white" : "text-[#30313D]";
  const textMuted = darkmode ? "text-neutral-400" : "text-[#6B6D80]";
  const textSubtle = darkmode ? "text-neutral-500" : "text-[#9B9DAF]";
  const surface = darkmode ? "bg-neutral-900" : "bg-[#F7F8F9]";
  const cardBg = darkmode ? "bg-neutral-800 border-neutral-700" : "bg-white border-[#E4E5ED]";

  return (
    <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${border} gap-3 flex-wrap`}>
        <div className="flex items-center gap-2">
          <FaUser className="text-[#06AB78] text-[13px]" />
          <span className={`text-[13px] font-bold ${textPrimary}`}>Users</span>
          <span className={`text-[11px] ${textMuted} bg-[rgba(6,171,120,0.07)] rounded-full px-2 py-0.5 tabular-nums border border-[rgba(6,171,120,0.15)]`}>
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <FaSearch className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${textSubtle} text-[11px] pointer-events-none`} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search name, email, ID…"
            className={`pl-8 pr-3 py-1.5 text-xs border rounded-[10px] outline-none w-[210px] transition-colors ${
              darkmode ? "bg-neutral-700 text-white border-neutral-600 placeholder:text-neutral-500" : "bg-white text-[#30313D] border-[#E4E5ED] placeholder:text-[#9B9DAF]"
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className={`border-b ${border} ${surface}`}>
            <tr>
              {[
                { label: "Name", col: "name", icon: <FaUser className={`inline mr-1.5 ${textSubtle} text-[11px]`} /> },
                { label: "Email", col: "email", icon: <FaEnvelope className={`inline mr-1.5 ${textSubtle} text-[11px]`} /> },
                { label: "Visits", col: "visits", icon: null },
                { label: "Last Seen", col: "lastSeen", icon: null },
              ].map(({ label, col, icon }) => (
                <th key={col} onClick={() => toggleSort(col)} className={`px-4 py-2.5 text-left text-[11px] font-bold ${textMuted} cursor-pointer select-none whitespace-nowrap tracking-[0.05em] uppercase`}>
                  {icon}{label} <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                </th>
              ))}
              {["Location", "Browser / OS", "Settings"].map((label) => (
                <th key={label} className={`px-4 py-2.5 text-left text-[11px] font-bold ${textMuted} whitespace-nowrap tracking-[0.05em] uppercase`}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((u, i) => (
                <tr key={u.id} className={`transition-colors hover:bg-[rgba(6,171,120,0.07)] ${i > 0 ? `border-t ${border}` : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} darkmode={darkmode} />
                      <span className={`text-[13px] ${textPrimary} font-semibold truncate max-w-[140px]`}>
                        {u.name || <span className={`${textMuted} italic font-normal`}>Anonymous</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] ${textMuted} truncate block max-w-[180px]`}>
                      {u.email || <span className={`${textSubtle} italic`}>—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-bold text-[#06AB78] tabular-nums">{u.visits ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] ${textMuted} whitespace-nowrap`}>{fmtDate(u.lastSeen)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`flex items-center gap-1.5 text-[13px] ${textMuted}`}>
                        <span>{getFlag(countryCodes[u.country])}</span>
                        <span className="truncate max-w-[90px]">{u.country || "—"}</span>
                      </span>
                      {u.city && <span className={`text-[11px] ${textSubtle} truncate max-w-[90px]`}>{u.city}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`flex items-center gap-1.5 text-[13px] ${textMuted}`}>
                        {getBrowserIcon(u.browser)}
                        <span className="truncate max-w-[80px]">{u.browser || "—"}</span>
                      </span>
                      {u.os && (
                        <span className={`flex items-center gap-1.5 text-[11px] ${textSubtle}`}>
                          {getOSIcon(u.os)}
                          <span className="truncate max-w-[80px]">{u.os}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {creator !== u.email ? (
                      <UserSettingsDropdown tracker_id={tracker_id} user={u} onAdminChange={handleAdminChange} darkmode={darkmode} />
                    ) : (
                      <span className="text-[11px] font-semibold border px-2 py-0.5 text-white bg-amber-400 rounded-2xl flex items-center gap-1 w-fit">
                        <FaCrown className="text-[10px]" /> Owner
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={`px-4 py-10 text-center text-[13px] ${textSubtle}`}>
                  {search ? "No users match your search." : "No user data available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={`flex items-center justify-between px-5 py-3 border-t ${border} ${surface}`}>
          <span className={`text-xs ${textSubtle}`}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            {[
              { label: "←", action: () => setPage((p) => Math.max(0, p - 1)), disabled: page === 0 },
              ...Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return { label: pageNum + 1, action: () => setPage(pageNum), active: pageNum === page };
              }),
              { label: "→", action: () => setPage((p) => Math.min(totalPages - 1, p + 1)), disabled: page >= totalPages - 1 },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                  btn.active
                    ? "bg-[#06AB78] border-[#06AB78] text-white"
                    : btn.disabled
                      ? `${darkmode ? "bg-neutral-700 border-neutral-600 text-neutral-500" : "bg-white border-[#E4E5ED] text-[#9B9DAF]"} opacity-35 cursor-not-allowed`
                      : darkmode
                        ? "bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer hover:border-[#06AB78]"
                        : "bg-white border-[#E4E5ED] text-[#6B6D80] cursor-pointer hover:border-[#06AB78]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleCard({ title, rows, icon, collapsible = false, darkmode }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 5;
  const max = Math.max(0, ...rows.map((r) => r.value));
  const visible = collapsible && !expanded ? rows.slice(0, LIMIT) : rows;
  const hasMore = collapsible && rows.length > LIMIT;

  return (
    <div className={`rounded-md border p-4 flex flex-col ${darkmode ? "bg-neutral-900 border-neutral-800" : "border-neutral-300/90 bg-neutral-50/40"}`}>
      <div className="text-xs font-light text-neutral-400 tracking-wide mb-3">
        {title}
        <span className={`ml-2 font-normal normal-case ${darkmode ? "text-white" : "text-neutral-300"}`}>{rows.length}</span>
      </div>
      <div className="overflow-y-auto max-h-66 flex flex-col gap-2.5 pr-1">
        {visible.length > 0 ? (
          visible.map((row) => {
            const pct = max > 0 ? Math.round((row.value / max) * 100) : 0;
            return (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-sm">{icon(row)}</span>
                  <span className={`text-xs font-medium truncate ${darkmode ? "text-white" : "text-neutral-800"}`}>{row.label}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`font-bold tabular-nums text-xs w-10 text-right ${darkmode ? "text-white" : "text-neutral-800"}`}>
                    {row.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-neutral-400 text-center py-3">No data</p>
        )}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full py-1.5 text-xs font-semibold text-[#06AB78] bg-[rgba(6,171,120,0.05)] hover:bg-[rgba(6,171,120,0.10)] rounded-lg border border-[rgba(6,171,120,0.15)] transition-colors cursor-pointer"
        >
          {expanded ? "↑ Show less" : `↓ Show ${rows.length - LIMIT} more`}
        </button>
      )}
    </div>
  );
}

function CityCard({ rows, darkmode }) {
  const [search, setSearch] = useState("");
  const max = Math.max(0, ...rows.map((r) => r.value));
  const filtered = rows.filter((r) => r.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`rounded-sm border p-4 flex flex-col ${darkmode ? "bg-neutral-900 border-neutral-800" : "border-neutral-300/90 bg-neutral-50/40"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-light text-neutral-400 tracking-wide">
          Cities
          <span className={`ml-2 font-normal normal-case ${darkmode ? "text-white" : "text-neutral-300"}`}>{rows.length}</span>
        </span>
      </div>
      <div className="relative mb-3">
        <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9DAF] text-[9px] pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter cities…"
          className={`w-full pl-7 pr-3 py-1.5 text-[11px] border rounded-lg outline-none focus:border-[#06AB78] transition-colors ${
            darkmode ? "bg-neutral-800 text-white border-neutral-700 placeholder:text-neutral-500" : "bg-white text-neutral-700 border-neutral-300/90"
          }`}
        />
      </div>
      <div className="overflow-y-auto max-h-[220px] flex flex-col gap-2 pr-1">
        {filtered.length > 0 ? (
          filtered.map((row) => {
            const pct = max > 0 ? Math.round((row.value / max) * 100) : 0;
            return (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FaMapMarker className="text-[9px] text-neutral-400 shrink-0" />
                  <span className={`text-xs font-medium truncate ${darkmode ? "text-white" : "text-neutral-800"}`}>{row.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1 rounded-full bg-neutral-200 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[11px] font-bold tabular-nums w-8 text-right ${darkmode ? "text-white" : "text-neutral-700"}`}>
                    {row.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-[11px] text-neutral-400 text-center py-4">{search ? "No cities match" : "No data"}</p>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsComponents({ TRACKER_ID, user_email, darkmode = false }) {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const [period, setPeriod] = useState("Last 7 days");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchStats(selectedPeriod, fromOverride, toOverride) {
    setLoading(true);
    setError(null);
    try {
      let fromDate, toDate;
      if (selectedPeriod === "Custom range") { fromDate = fromOverride ?? customFrom; toDate = toOverride ?? customTo; }
      else { ({ fromDate, toDate } = getDateRange(selectedPeriod)); }
      const params = new URLSearchParams({ id: TRACKER_ID });
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      const res = await fetch(`${API_BASE}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Unknown error");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(period); }, [period]);

  useEffect(() => {
    if (!chartRef.current || !data?.graph) return;
    if (chartInst.current) chartInst.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    const grad = buildChartGradient(ctx);
    chartInst.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.graph.map((d) => d.label),
        datasets: [{
          data: data.graph.map((d) => d.visits),
          borderColor: P.primary, borderWidth: 2.5, backgroundColor: grad,
          fill: true, tension: 0.45, pointRadius: 0, pointHoverRadius: 5,
          pointHoverBackgroundColor: P.primary, pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2,
        }],
      },
      options: CHART_OPTIONS,
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [data]);

  return (
    <div className={`min-h-screen ${darkmode ? "bg-neutral-900" : "bg-neutral-50/40"} py-6`}>
      <div className="max-w-255 mx-auto flex flex-col gap-4">

        {/* Top bar */}
        <div className="flex items-center gap-2.5 flex-wrap relative">
          <div className="flex">
            <button
              onClick={() => fetchStats(period)}
              disabled={loading}
              className={`w-8 flex items-center justify-center rounded-l-lg cursor-pointer text-base transition-colors ${
                darkmode ? "text-white bg-neutral-800 hover:bg-neutral-700 border-r border-neutral-700" : "border text-[#6B6D80] border-[#E4E5ED] bg-white hover:bg-neutral-50/40 hover:text-neutral-700"
              } ${loading ? "opacity-50" : ""}`}
            >
              <span className={loading ? "inline-block animate-spin" : ""}>↻</span>
            </button>
            <div className={`flex items-center gap-2 px-3.5 py-1.5 ${darkmode ? "bg-neutral-800 text-white" : "border-t border-b border-[#E4E5ED] bg-white"}`}>
              <span className={`text-[13px] font-medium ${darkmode ? "text-white" : "text-[#30313D]"}`}>
                {data?.domain || "Loading..."}
              </span>
            </div>
            <Link
              href={`/settings/${TRACKER_ID}`}
              className={`w-8 flex items-center justify-center rounded-r-lg cursor-pointer ${
                darkmode ? "border-l border-neutral-700 text-white bg-neutral-800 hover:bg-neutral-700" : "border border-[#E4E5ED] text-[#6B6D80] bg-white text-base transition-colors hover:bg-neutral-50/40 hover:text-neutral-700"
              } ${loading ? "opacity-50" : ""}`}
            >
              ⚙
            </Link>
          </div>
          <div className="relative">
            <PeriodDropdown
              darkmode={darkmode}
              value={period}
              onChange={(p) => { setPeriod(p); setCustomFrom(null); setCustomTo(null); }}
              customLabel={
                customFrom && customTo
                  ? `${new Date(customFrom + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(customTo + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : null
              }
              onCustomClick={() => setShowCalendar(true)}
            />
            {showCalendar && (
              <CustomRangePicker
                initialFrom={customFrom}
                initialTo={customTo}
                onApply={(from, to) => { setCustomFrom(from); setCustomTo(to); setPeriod("Custom range"); setShowCalendar(false); fetchStats("Custom range", from, to); }}
                onCancel={() => setShowCalendar(false)}
              />
            )}
          </div>
          {data?.bucketMode && (
            <span className={`text-xs ml-auto capitalize ${darkmode ? "text-neutral-400" : "text-neutral-500"}`}>
              Showing {data.bucketMode === "day" ? "daily" : data.bucketMode === "week" ? "weekly" : "monthly"} data
            </span>
          )}
        </div>

        {error && <ErrorBanner message={`Failed to load: ${error}`} onRetry={() => fetchStats(period)} />}

        {/* Stat cards + chart */}
        <div className={`rounded-lg border p-5 ${darkmode ? "border-neutral-800 bg-neutral-800" : "border-[#E4E5ED] bg-white"}`}>
          {loading ? <Spinner /> : data && (
            <>
              <div className="px-6 py-2 grid grid-cols-1 md:grid-cols-6 gap-4">
                <StatCard darkmode={darkmode} label="Visitors" value={data.totalVisits} trend={data.totalVisitsChange} up={data.totalVisitsChange > 0} />
                <StatCard darkmode={darkmode} label="Unique" value={data.uniqueVisitors} trend={data.uniqueVisitorsChange} up={data.uniqueVisitorsChange > 0} />
                <StatCard darkmode={darkmode} label="Sessions" value={data.totalSessions} trend={data.totalSessionsChange} up={data.totalSessionsChange > 0} />
                <StatCard darkmode={darkmode} label="Bounce Rate" value={data.bounceRate} trend={data.bounceRateChange} up={data.bounceRateChange < 0} />
                <StatCard darkmode={darkmode} label="Avg Time" value={fmtTime(data.avgTimeSpent)} trend={data.avgTimeSpentChange} up={data.avgTimeSpentChange > 0} />
                <StatCard darkmode={darkmode} label="Pages/visitor" value={data.avgVisitsPerUser} trend={data.avgVisitsPerUserChange} up={data.avgVisitsPerUserChange > 0} />
              </div>
              <div className={`mt-5 max-w-232 px-5 border mx-auto relative h-80 py-5 rounded-lg ${darkmode ? "bg-neutral-900 border-neutral-700" : "bg-gray-50/40 border-neutral-300/90"}`}>
                <canvas ref={chartRef} />
              </div>
            </>
          )}

          {!loading && data && (
            <div className="px-6 py-5">
              <div className="grid grid-cols-3 mb-5 gap-4">
                <div className="col-span-2">
                  <CollapsibleCard darkmode={darkmode} title="Referrers" rows={getLeftRows(data, "Referrer")} icon={(r) => getReferrerIcon(r.label)} />
                </div>
                <CollapsibleCard darkmode={darkmode} title="Devices" rows={getLeftRows(data, "Device")} icon={(r) => getDeviceIcon(r.label)} />
              </div>
              <div className="grid grid-cols-3 mb-5 gap-4">
                <CollapsibleCard darkmode={darkmode} title="Browsers" rows={getLeftRows(data, "Browser")} icon={(r) => getBrowserIcon(r.label)} />
                <CollapsibleCard darkmode={darkmode} title="OS" rows={getLeftRows(data, "OS")} icon={(r) => getOSIcon(r.label)} />
                <CollapsibleCard darkmode={darkmode} title="Countries" rows={getRightRows(data, "Country")} icon={(r) => <span>{getFlag(data?.country_codes?.[r.label])}</span>} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <CollapsibleCard darkmode={darkmode} title="Pages" rows={getRightRows(data, "Page")} icon={() => <FaPaperclip style={iconStyle} />} />
                </div>
                <CityCard darkmode={darkmode} rows={getRightRows(data, "City")} />
              </div>
            </div>
          )}
        </div>

        {!loading && data && (
          <UsersTable
            darkmode={darkmode}
            tracker_id={TRACKER_ID}
            users={data.users ?? []}
            creator={data.creator ?? ""}
            countryCodes={data.country_codes ?? {}}
          />
        )}
      </div>
      {!loading && data && <NotConnectedBadge connected={data.connected} />}
    </div>
  );
}