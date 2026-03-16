"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import {
  FaChrome,
  FaFacebook,
  FaGoogle,
  FaLink,
  FaTwitter,
  FaGithub,
  FaYoutube,
  FaLinkedin,
  FaReddit,
  FaInstagram,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaMobile,
  FaTablet,
  FaDesktop,
  FaWindows,
  FaApple,
  FaLinux,
  FaUser,
  FaEnvelope,
  FaAndroid,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaPaperclip,
  FaMapMarker,
} from "react-icons/fa";

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
  const daysAgo = (n) =>
    new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
  switch (period) {
    case "Today":
      return { fromDate: today, toDate: today };
    case "Yesterday":
      return { fromDate: daysAgo(1), toDate: daysAgo(1) };
    case "Last 7 days":
      return { fromDate: daysAgo(7), toDate: today };
    case "Last 30 days":
      return { fromDate: daysAgo(30), toDate: today };
    case "All time":
      return { fromDate: null, toDate: null };
    default:
      return { fromDate: daysAgo(7), toDate: today };
  }
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PERIODS = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "All time",
  "Custom range",
];

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
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function topEntries(obj = {}) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

const COUNTRY_FLAGS = {
  "United States": "🇺🇸",
  India: "🇮🇳",
  Canada: "🇨🇦",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Australia: "🇦🇺",
  Brazil: "🇧🇷",
  Japan: "🇯🇵",
  Morocco: "🇲🇦",
  Portugal: "🇵🇹",
  Italy: "🇮🇹",
  Indonesia: "🇮🇩",
  Pakistan: "🇵🇰",
  Spain: "🇪🇸",
};
function getFlag(c) {
  return COUNTRY_FLAGS[c] ?? "🌐";
}

const iconStyle = { color: P.baseSoft };

function getReferrerIcon(r) {
  if (!r || r === "Direct") return <FaLink style={iconStyle} />;
  if (/google/i.test(r)) return <FaGoogle style={iconStyle} />;
  if (/twitter|x\.com/i.test(r)) return <FaTwitter style={iconStyle} />;
  if (/facebook/i.test(r)) return <FaFacebook style={{ color: "#1877F2" }} />;
  if (/github/i.test(r)) return <FaGithub style={iconStyle} />;
  if (/youtube/i.test(r)) return <FaYoutube style={{ color: "#FF0000" }} />;
  if (/linkedin/i.test(r)) return <FaLinkedin style={iconStyle} />;
  if (/reddit/i.test(r)) return <FaReddit style={{ color: "#FF4500" }} />;
  if (/instagram/i.test(r)) return <FaInstagram style={{ color: "#E1306C" }} />;
  return <FaLink style={iconStyle} />;
}
function getDeviceIcon(d) {
  return d === "Mobile" ? (
    <FaMobile style={iconStyle} />
  ) : d === "Tablet" ? (
    <FaTablet style={iconStyle} />
  ) : (
    <FaDesktop style={iconStyle} />
  );
}
function getBrowserIcon(b) {
  if (/chrome/i.test(b)) return <FaChrome style={iconStyle} />;
  if (/firefox/i.test(b)) return <FaFirefox style={{ color: "#FF7139" }} />;
  if (/safari/i.test(b)) return <FaSafari style={{ color: "#006CFF" }} />;
  if (/edge/i.test(b)) return <FaEdge style={{ color: "#0078D4" }} />;
  return <FaLink style={iconStyle} />;
}
function getOSIcon(o) {
  if (/windows/i.test(o)) return <FaWindows style={iconStyle} />;
  if (/macos/i.test(o)) return <FaApple style={iconStyle} />;
  if (/linux/i.test(o)) return <FaLinux style={iconStyle} />;
  if (/android/i.test(o)) return <FaAndroid style={{ color: "#3DDC84" }} />;
  if (/ios/i.test(o)) return <FaApple style={iconStyle} />;
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
  return topEntries(obj).map(([k, v]) => ({
    label: k,
    value: v,
    icon: iconFn(k),
  }));
}

function getRightRows(data, tab) {
  if (!data) return [];
  const maps = {
    Country: [data.countries, getFlag],
    City: [data.cities, () => <FaMapMarker style={iconStyle} />],
    Page: [data.visitedPages, () => <FaPaperclip style={iconStyle} />],
  };
  const [obj, iconFn] = maps[tab] || [];
  if (!obj) return [];
  return topEntries(obj).map(([k, v]) => ({
    label: k,
    value: v,
    icon: iconFn(k),
  }));
}

function CalendarMonth({
  year,
  month,
  rangeStart,
  rangeEnd,
  hovered,
  onDayClick,
  onDayHover,
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dayState(d) {
    if (!d) return "empty";
    const iso = isoDate(new Date(year, month, d));
    const effectiveEnd = rangeEnd || hovered;
    const lo =
      rangeStart && effectiveEnd
        ? rangeStart < effectiveEnd
          ? rangeStart
          : effectiveEnd
        : rangeStart;
    const hi =
      rangeStart && effectiveEnd
        ? rangeStart < effectiveEnd
          ? effectiveEnd
          : rangeStart
        : rangeStart;

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
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-[#9B9DAF] py-0.5"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = isoDate(new Date(year, month, d));
          const state = dayState(d);
          const isToday = iso === today;
          const isFuture = iso > today;

          const bgClass =
            {
              start: "bg-[#06AB78]",
              end: "bg-[#06AB78]",
              "start-only": "bg-[#06AB78]",
              "in-range": "bg-[rgba(6,171,120,0.15)]",
              default: "bg-transparent",
            }[state] ?? "bg-transparent";

          const textClass =
            {
              start: "text-white",
              end: "text-white",
              "start-only": "text-white",
              "in-range": "text-[#06AB78]",
              default: isFuture ? "text-[#9B9DAF]" : "text-[#30313D]",
            }[state] ?? "text-[#30313D]";

          return (
            <div
              key={i}
              onClick={() => !isFuture && onDayClick(iso)}
              onMouseEnter={() => !isFuture && onDayHover(iso)}
              onMouseLeave={() => onDayHover(null)}
              className={[
                "text-center text-xs py-[5px] rounded-md transition-colors",
                state !== "default" ? "font-bold" : "font-normal",
                isFuture
                  ? "opacity-35 cursor-default"
                  : "cursor-pointer hover:bg-[rgba(6,171,120,0.07)]",
                bgClass,
                textClass,
                isToday && state === "default"
                  ? "outline outline-[1.5px] outline-[#06AB78]"
                  : "",
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
  const right =
    viewMonth === 11
      ? { y: viewYear + 1, m: 0 }
      : { y: viewYear, m: viewMonth + 1 };

  function handleDayClick(iso) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(iso);
      setRangeEnd(null);
    } else {
      if (iso < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(iso);
      } else {
        setRangeEnd(iso);
      }
    }
  }

  function nav(dir) {
    if (dir === -1) {
      if (viewMonth === 0) {
        setViewYear((y) => y - 1);
        setViewMonth(11);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewYear((y) => y + 1);
        setViewMonth(0);
      } else {
        setViewMonth((m) => m + 1);
      }
    }
  }

  const canApply = rangeStart && rangeEnd;
  const fmt = (iso) =>
    iso
      ? new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <div className="absolute top-[calc(100%+6px)] left-0 z-[100] bg-white border border-[#E4E5ED] rounded-2xl p-5 shadow-[0_12px_32px_rgba(48,49,61,0.14)]">
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={() => nav(-1)}
          className="border border-[#E4E5ED] bg-transparent cursor-pointer text-[#6B6D80] text-sm px-2.5 py-0.5 rounded-lg hover:border-[#06AB78]"
        >
          ‹
        </button>
        <button
          onClick={() => nav(1)}
          className="border border-[#E4E5ED] bg-transparent cursor-pointer text-[#6B6D80] text-sm px-2.5 py-0.5 rounded-lg hover:border-[#06AB78]"
        >
          ›
        </button>
      </div>
      <div className="flex gap-6">
        <CalendarMonth
          year={left.y}
          month={left.m}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hovered={hovered}
          onDayClick={handleDayClick}
          onDayHover={setHovered}
        />
        <div className="w-px bg-[#E4E5ED]" />
        <CalendarMonth
          year={right.y}
          month={right.m}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hovered={hovered}
          onDayClick={handleDayClick}
          onDayHover={setHovered}
        />
      </div>
      <div className="mt-3.5 pt-3.5 border-t border-[#E4E5ED] flex items-center justify-between gap-3">
        <div className="text-xs text-[#6B6D80] flex-1">
          {rangeStart ? (
            <>
              <span className="font-semibold text-[#30313D]">
                {fmt(rangeStart)}
              </span>
              {" → "}
              <span
                className={`font-semibold ${rangeEnd ? "text-[#30313D]" : "text-[#9B9DAF]"}`}
              >
                {rangeEnd ? fmt(rangeEnd) : "pick end date"}
              </span>
            </>
          ) : (
            <span className="text-[#9B9DAF]">Select a start date</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#E4E5ED] bg-transparent text-[#6B6D80] cursor-pointer hover:border-[#06AB78]"
          >
            Cancel
          </button>
          <button
            onClick={() => canApply && onApply(rangeStart, rangeEnd)}
            disabled={!canApply}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border-none transition-colors ${canApply ? "bg-[#06AB78] text-white cursor-pointer" : "bg-[rgba(6,171,120,0.15)] text-[#9B9DAF] cursor-default"}`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function NotConnectedBadge() {
  return (
    <div className="fixed bottom-5 bg-yellow-100 left-5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500 shadow-sm text-xs font-medium text-[#6B6D80] select-none pointer-events-none">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      Not connected
    </div>
  );
}

function Avatar({ name }) {
  if (!name) return <FaUser className="text-[#9B9DAF]" />;
  const initials = (name || "Anonymous")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const palettes = [
    { bg: "rgba(6,171,120,0.15)", color: "#06AB78" },
    { bg: "rgba(48,49,61,0.10)", color: "#30313D" },
    { bg: "rgba(6,171,120,0.10)", color: "#048059" },
    { bg: "rgba(85,86,104,0.12)", color: "#555668" },
  ];
  const p = palettes[(name?.charCodeAt(0) ?? 0) % palettes.length];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: p.bg, color: p.color }}
    >
      {initials}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <div className="flex items-center gap-1.5">
        {accent && (
          <span
            className="w-2.5 h-2.5 rounded-[3px] shrink-0"
            style={{ background: accent }}
          />
        )}
        <span className="text-[11px] text-[#6B6D80] font-medium tracking-[0.04em] uppercase">
          {label}
        </span>
      </div>
      <span className="text-[26px] font-extrabold text-[#30313D] tabular-nums leading-none">
        {value ?? "–"}
      </span>
    </div>
  );
}

function VDivider() {
  return <div className="w-px h-12 bg-[#E4E5ED] shrink-0 self-center" />;
}

function TabBar({ options, active, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all ${
            active === o
              ? "bg-[#06AB78] text-white"
              : "bg-transparent text-[#6B6D80] hover:text-[#06AB78]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function BarRow({ label, value, max, icon }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-base w-5 text-center shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-[13px] text-[#30313D] truncate">{label}</span>
          <span className="text-[13px] font-bold text-[#30313D] ml-2 tabular-nums">
            {value}
          </span>
        </div>
        <div className="h-[5px] rounded-full bg-[rgba(6,171,120,0.15)] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, #06AB78, #08C98D)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PeriodDropdown({ value, onChange, customLabel, onCustomClick }) {
  const [open, setOpen] = useState(false);
  const displayLabel =
    value === "Custom range" && customLabel ? customLabel : value;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 border border-[#E4E5ED] rounded-[10px] px-3 py-1.5 text-[13px] font-medium text-[#30313D] bg-white cursor-pointer transition-colors max-w-[240px] hover:border-[#06AB78]"
      >
        <span className="truncate">{displayLabel}</span>
        <span className="text-[#9B9DAF] ml-0.5 text-[10px] shrink-0">▾</span>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-white border border-[#E4E5ED] rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(48,49,61,0.12)] min-w-[160px]">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => {
                if (p === "Custom range") {
                  setOpen(false);
                  onCustomClick();
                } else {
                  onChange(p);
                  setOpen(false);
                }
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer border-none flex items-center gap-2 transition-colors hover:bg-[rgba(6,171,120,0.07)] ${
                p === value
                  ? "bg-[rgba(6,171,120,0.07)] text-[#06AB78] font-semibold"
                  : "bg-transparent text-[#30313D] font-normal"
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
      <button
        onClick={onRetry}
        className="text-xs text-[#C62828] bg-none border-none cursor-pointer underline"
      >
        Retry
      </button>
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
      backgroundColor: "#30313D",
      borderColor: "#3E3F4D",
      borderWidth: 1,
      titleColor: "#9B9DAF",
      bodyColor: "#fff",
      padding: 10,
      callbacks: { label: (c) => ` ${c.parsed.y} visitors` },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(48,49,61,0.05)", drawBorder: false },
      ticks: {
        color: "#9B9DAF",
        font: { size: 11 },
        maxRotation: 0,
        maxTicksLimit: 10,
      },
      border: { display: false },
    },
    y: {
      min: 0,
      grid: { color: "rgba(48,49,61,0.05)", drawBorder: false },
      ticks: { color: "#9B9DAF", font: { size: 11 }, stepSize: 1 },
      border: { display: false },
    },
  },
};

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <FaSort className="text-[#9B9DAF] ml-1 inline" />;
  return sortDir === "asc" ? (
    <FaSortUp className="text-[#06AB78] ml-1 inline" />
  ) : (
    <FaSortDown className="text-[#06AB78] ml-1 inline" />
  );
}

function UsersTable({ users = [] }) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("lastSeen");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(0);
  }

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.userId?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortCol] ?? "",
        bv = b[sortCol] ?? "";
      if (sortCol === "visits") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (sortCol === "lastSeen" || sortCol === "dateCreated") {
        av = new Date(av).getTime() || 0;
        bv = new Date(bv).getTime() || 0;
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-[#E4E5ED] overflow-hidden bg-white">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E5ED] gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FaUser className="text-[#06AB78] text-[13px]" />
          <span className="text-[13px] font-bold text-[#30313D]">Users</span>
          <span className="text-[11px] text-[#6B6D80] bg-[rgba(6,171,120,0.07)] rounded-full px-2 py-0.5 tabular-nums border border-[rgba(6,171,120,0.15)]">
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9DAF] text-[11px] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, email, ID…"
            className="pl-8 pr-3 py-1.5 text-xs border border-[#E4E5ED] rounded-[10px] text-[#30313D] outline-none w-[210px] transition-colors bg-white focus:border-[#06AB78]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="bg-[#F7F8F9] border-b border-[#E4E5ED]">
            <tr>
              {[
                {
                  label: "Name",
                  col: "name",
                  icon: (
                    <FaUser className="inline mr-1.5 text-[#9B9DAF] text-[11px]" />
                  ),
                },
                {
                  label: "Email",
                  col: "email",
                  icon: (
                    <FaEnvelope className="inline mr-1.5 text-[#9B9DAF] text-[11px]" />
                  ),
                },
                { label: "Visits", col: "visits", icon: null },
                { label: "Last Seen", col: "lastSeen", icon: null },
              ].map(({ label, col, icon }) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-4 py-2.5 text-left text-[11px] font-bold text-[#6B6D80] cursor-pointer select-none whitespace-nowrap tracking-[0.05em] uppercase"
                >
                  {icon}
                  {label}{" "}
                  <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                </th>
              ))}
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#6B6D80] whitespace-nowrap tracking-[0.05em] uppercase">
                Location
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#6B6D80] whitespace-nowrap tracking-[0.05em] uppercase">
                Browser / OS
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((u, i) => (
                <tr
                  key={u.id}
                  className={`transition-colors hover:bg-[rgba(6,171,120,0.07)] ${i > 0 ? "border-t border-[#E4E5ED]" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} />
                      <span className="text-[13px] text-[#30313D] font-semibold truncate max-w-[140px]">
                        {u.name || (
                          <span className="text-[#9B9DAF] italic font-normal">
                            Anonymous
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-[#6B6D80] truncate block max-w-[180px]">
                      {u.email || (
                        <span className="text-[#9B9DAF] italic">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-bold text-[#06AB78] tabular-nums">
                      {u.visits ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-[#6B6D80] whitespace-nowrap">
                      {fmtDate(u.lastSeen)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-[13px] text-[#6B6D80]">
                        <span>{getFlag(u.country)}</span>
                        <span className="truncate max-w-[90px]">
                          {u.country || "—"}
                        </span>
                      </span>
                      {u.city && (
                        <span className="text-[11px] text-[#9B9DAF] truncate max-w-[90px]">
                          {u.city}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-[13px] text-[#6B6D80]">
                        {getBrowserIcon(u.browser)}
                        <span className="truncate max-w-[80px]">
                          {u.browser || "—"}
                        </span>
                      </span>
                      {u.os && (
                        <span className="flex items-center gap-1.5 text-[11px] text-[#9B9DAF]">
                          {getOSIcon(u.os)}
                          <span className="truncate max-w-[80px]">{u.os}</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[13px] text-[#9B9DAF]"
                >
                  {search
                    ? "No users match your search."
                    : "No user data available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E5ED] bg-[#F7F8F9]">
          <span className="text-xs text-[#9B9DAF]">
            {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-1">
            {[
              {
                label: "←",
                action: () => setPage((p) => Math.max(0, p - 1)),
                disabled: page === 0,
              },
              ...Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum =
                  totalPages <= 5
                    ? i
                    : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return {
                  label: pageNum + 1,
                  action: () => setPage(pageNum),
                  active: pageNum === page,
                };
              }),
              {
                label: "→",
                action: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
                disabled: page >= totalPages - 1,
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                  btn.active
                    ? "bg-[#06AB78] border-[#06AB78] text-white"
                    : btn.disabled
                      ? "bg-white border-[#E4E5ED] text-[#9B9DAF] opacity-35 cursor-not-allowed"
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

export default function AnalyticsComponents({ TRACKER_ID }) {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const [period, setPeriod] = useState("Last 7 days");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [leftTab, setLeftTab] = useState("Referrer");
  const [rightTab, setRightTab] = useState("Country");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchStats(selectedPeriod, fromOverride, toOverride) {
    setLoading(true);
    setError(null);
    try {
      let fromDate, toDate;
      if (selectedPeriod === "Custom range") {
        fromDate = fromOverride ?? customFrom;
        toDate = toOverride ?? customTo;
      } else {
        ({ fromDate, toDate } = getDateRange(selectedPeriod));
      }
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

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  useEffect(() => {
    if (!chartRef.current || !data?.graph) return;
    if (chartInst.current) chartInst.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    const grad = buildChartGradient(ctx);
    chartInst.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.graph.map((d) => d.label),
        datasets: [
          {
            data: data.graph.map((d) => d.visits),
            borderColor: P.primary,
            borderWidth: 2.5,
            backgroundColor: grad,
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: P.primary,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: CHART_OPTIONS,
    });
    return () => {
      if (chartInst.current) chartInst.current.destroy();
    };
  }, [data]);

  const leftRows = getLeftRows(data, leftTab);
  const rightRows = getRightRows(data, rightTab);
  const leftMax = Math.max(0, ...leftRows.map((r) => r.value));
  const rightMax = Math.max(0, ...rightRows.map((r) => r.value));

  return (
    <div className="min-h-screen bg-[#F7F8F9] p-6 font-['Inter',sans-serif]">
      <div className="max-w-[960px] mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2.5 flex-wrap relative">
          <div className="flex items-center gap-2 border border-[#E4E5ED] rounded-[10px] px-3.5 py-1.5 bg-white">
            <span className="text-xs font-mono text-[#06AB78] font-bold">
              {"</>"}
            </span>
            <span className="text-[13px] font-medium text-[#30313D]">
              analytics.sakshamjain.dev
            </span>
          </div>

          <div className="relative">
            <PeriodDropdown
              value={period}
              onChange={(p) => {
                setPeriod(p);
                setCustomFrom(null);
                setCustomTo(null);
              }}
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
                onApply={(from, to) => {
                  setCustomFrom(from);
                  setCustomTo(to);
                  setPeriod("Custom range");
                  setShowCalendar(false);
                  fetchStats("Custom range", from, to);
                }}
                onCancel={() => setShowCalendar(false)}
              />
            )}
          </div>

          <button
            onClick={() => fetchStats(period)}
            disabled={loading}
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] border border-[#E4E5ED] cursor-pointer text-[#6B6D80] bg-white text-base transition-colors hover:border-[#06AB78] hover:text-[#06AB78] ${loading ? "opacity-50" : ""}`}
          >
            <span className={loading ? "inline-block animate-spin" : ""}>
              ↻
            </span>
          </button>
          <button
            onClick={() => fetchStats(period)}
            disabled={loading}
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] border border-[#E4E5ED] cursor-pointer text-[#6B6D80] bg-white text-base transition-colors hover:border-[#06AB78] hover:text-[#06AB78] ${loading ? "opacity-50" : ""}`}
          >
            <span className={loading ? "inline-block animate-spin" : ""}>
              ⚙
            </span>
          </button>

          {data?.bucketMode && (
            <span className="text-xs text-[#6B6D80] ml-auto capitalize">
              Showing{" "}
              {data.bucketMode === "day"
                ? "daily"
                : data.bucketMode === "week"
                  ? "weekly"
                  : "monthly"}{" "}
              data
            </span>
          )}
        </div>

        {error && (
          <ErrorBanner
            message={`Failed to load: ${error}`}
            onRetry={() => fetchStats(period)}
          />
        )}

        <div className="rounded-2xl border border-[#E4E5ED] p-5 bg-white">
          {loading ? (
            <Spinner />
          ) : (
            data && (
              <>
                <div className="flex flex-wrap items-start gap-6">
                  <StatCard
                    label="Visitors"
                    value={data.totalVisits}
                    accent={P.primary}
                  />
                  <VDivider />
                  <StatCard
                    label="Unique"
                    value={data.uniqueVisitors}
                    accent={P.baseSoft}
                  />
                  <VDivider />
                  <StatCard label="Sessions" value={data.totalSessions} />
                  <VDivider />
                  <StatCard label="Bounce Rate" value={data.bounceRate} />
                  <VDivider />
                  <StatCard
                    label="Avg Time"
                    value={fmtTime(data.avgTimeSpent)}
                  />
                  <VDivider />
                  <StatCard
                    label="Pages/visitor"
                    value={data.avgVisitsPerUser}
                  />
                </div>
                <div className="mt-5 relative h-[260px]">
                  <canvas ref={chartRef} />
                </div>
              </>
            )
          )}
        </div>

        {!loading && data && (
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                tabs: ["Referrer", "Device", "Browser", "OS"],
                active: leftTab,
                onChange: setLeftTab,
                rows: leftRows,
                max: leftMax,
              },
              {
                tabs: ["Country", "City", "Page"],
                active: rightTab,
                onChange: setRightTab,
                rows: rightRows,
                max: rightMax,
              },
            ].map(({ tabs, active, onChange, rows, max }, pi) => (
              <div
                key={pi}
                className="rounded-2xl border border-[#E4E5ED] p-5 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <TabBar options={tabs} active={active} onChange={onChange} />
                  <span className="text-[11px] text-[#9B9DAF] font-semibold tracking-[0.04em]">
                    VISITORS ↓
                  </span>
                </div>
                <div className="border-t border-[#E4E5ED]">
                  {rows.length > 0 ? (
                    rows.map((r) => <BarRow key={r.label} {...r} max={max} />)
                  ) : (
                    <p className="text-[13px] text-[#9B9DAF] text-center py-5">
                      No data
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data && <UsersTable users={data.users ?? []} />}
      </div>

      <NotConnectedBadge />
    </div>
  );
}
