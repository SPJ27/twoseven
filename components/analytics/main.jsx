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

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  primary:      "#06AB78",
  primaryLight: "#08C98D",
  primaryDim:   "rgba(6,171,120,0.15)",
  primaryFaint: "rgba(6,171,120,0.07)",
  base:         "#30313D",
  baseMid:      "#3E3F4D",
  baseSoft:     "#555668",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F7F8F9",
  border:       "#E4E5ED",
  borderDark:   "rgba(48,49,61,0.12)",
  textMain:     "#30313D",
  textSub:      "#6B6D80",
  textFaint:    "#9B9DAF",
};

function getDateRange(period) {
  const today = new Date().toISOString().split("T")[0];
  const daysAgo = (n) =>
    new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
  switch (period) {
    case "Today":      return { fromDate: today, toDate: today };
    case "Yesterday":  return { fromDate: daysAgo(1), toDate: daysAgo(1) };
    case "Last 7 days":  return { fromDate: daysAgo(7), toDate: today };
    case "Last 30 days": return { fromDate: daysAgo(30), toDate: today };
    case "All time":   return { fromDate: null, toDate: null };
    default:           return { fromDate: daysAgo(7), toDate: today };
  }
}

const PERIODS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "All time"];

function fmtTime(secs) {
  const s = Math.round(Number(secs) || 0);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function topEntries(obj = {}) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

const COUNTRY_FLAGS = {
  "United States": "🇺🇸", India: "🇮🇳", Canada: "🇨🇦",
  "United Kingdom": "🇬🇧", Germany: "🇩🇪", France: "🇫🇷",
  Australia: "🇦🇺", Brazil: "🇧🇷", Japan: "🇯🇵",
  Morocco: "🇲🇦", Portugal: "🇵🇹", Italy: "🇮🇹",
  Indonesia: "🇮🇩", Pakistan: "🇵🇰", Spain: "🇪🇸",
};
function getFlag(c) { return COUNTRY_FLAGS[c] ?? "🌐"; }

const iconStyle = { color: P.baseSoft };
function getReferrerIcon(r) {
  if (!r || r === "Direct") return <FaLink style={iconStyle} />;
  if (/google/i.test(r))       return <FaGoogle style={iconStyle} />;
  if (/twitter|x\.com/i.test(r)) return <FaTwitter style={iconStyle} />;
  if (/facebook/i.test(r))     return <FaFacebook style={{ color: "#1877F2" }} />;
  if (/github/i.test(r))       return <FaGithub style={iconStyle} />;
  if (/youtube/i.test(r))      return <FaYoutube style={{ color: "#FF0000" }} />;
  if (/linkedin/i.test(r))     return <FaLinkedin style={iconStyle} />;
  if (/reddit/i.test(r))       return <FaReddit style={{ color: "#FF4500" }} />;
  if (/instagram/i.test(r))    return <FaInstagram style={{ color: "#E1306C" }} />;
  return <FaLink style={iconStyle} />;
}
function getDeviceIcon(d) {
  return d === "Mobile" ? <FaMobile style={iconStyle} />
       : d === "Tablet" ? <FaTablet style={iconStyle} />
       : <FaDesktop style={iconStyle} />;
}
function getBrowserIcon(b) {
  if (/chrome/i.test(b))  return <FaChrome style={iconStyle} />;
  if (/firefox/i.test(b)) return <FaFirefox style={{ color: "#FF7139" }} />;
  if (/safari/i.test(b))  return <FaSafari style={{ color: "#006CFF" }} />;
  if (/edge/i.test(b))    return <FaEdge style={{ color: "#0078D4" }} />;
  return <FaLink style={iconStyle} />;
}
function getOSIcon(o) {
  if (/windows/i.test(o)) return <FaWindows style={iconStyle} />;
  if (/macos/i.test(o))   return <FaApple style={iconStyle} />;
  if (/linux/i.test(o))   return <FaLinux style={iconStyle} />;
  if (/android/i.test(o)) return <FaAndroid style={{ color: "#3DDC84" }} />;
  if (/ios/i.test(o))     return <FaApple style={iconStyle} />;
  return <FaLink style={iconStyle} />;
}

function getLeftRows(data, tab) {
  if (!data) return [];
  const maps = {
    Referrer: [data.referrers, getReferrerIcon],
    Device:   [data.devices,   getDeviceIcon],
    Browser:  [data.browsers,  getBrowserIcon],
    OS:       [data.oses,      getOSIcon],
  };
  const [obj, iconFn] = maps[tab] || [];
  if (!obj) return [];
  return topEntries(obj).map(([k, v]) => ({ label: k, value: v, icon: iconFn(k) }));
}

function getRightRows(data, tab) {
  if (!data) return [];
  const maps = {
    Country: [data.countries,    getFlag],
    City:    [data.cities,       () => <FaMapMarker style={iconStyle} />],
    Page:    [data.visitedPages, () => <FaPaperclip style={iconStyle} />],
  };
  const [obj, iconFn] = maps[tab] || [];
  if (!obj) return [];
  return topEntries(obj).map(([k, v]) => ({ label: k, value: v, icon: iconFn(k) }));
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  if (!name) return <FaUser style={{ color: P.textFaint }} />;
  const initials = (name || "Anonymous")
    .split(" ").slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "").join("");
  const palettes = [
    { bg: P.primaryDim, color: P.primary },
    { bg: "rgba(48,49,61,0.10)", color: P.base },
    { bg: "rgba(6,171,120,0.10)", color: "#048059" },
    { bg: "rgba(85,86,104,0.12)", color: P.baseSoft },
  ];
  const p = palettes[(name?.charCodeAt(0) ?? 0) % palettes.length];
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, flexShrink: 0,
      background: p.bg, color: p.color,
    }}>
      {initials}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {accent && (
          <span style={{ width: 10, height: 10, borderRadius: 3, background: accent, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 11, color: P.textSub, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 26, fontWeight: 800, color: P.textMain, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
        {value ?? "–"}
      </span>
    </div>
  );
}

function VDivider() {
  return <div style={{ width: 1, height: 48, background: P.border, flexShrink: 0, alignSelf: "center" }} />;
}

// ── TabBar ─────────────────────────────────────────────────────────────────
function TabBar({ options, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
            background: active === o ? P.primary : "transparent",
            color: active === o ? "#fff" : P.textSub,
          }}
          onMouseEnter={(e) => { if (active !== o) e.target.style.color = P.primary; }}
          onMouseLeave={(e) => { if (active !== o) e.target.style.color = P.textSub; }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── BarRow ─────────────────────────────────────────────────────────────────
function BarRow({ label, value, max, icon }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: P.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: P.base, marginLeft: 8, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: P.primaryDim, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, width: `${pct}%`,
            background: `linear-gradient(90deg, ${P.primary}, ${P.primaryLight})`,
            transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    </div>
  );
}

// ── PeriodDropdown ─────────────────────────────────────────────────────────
function PeriodDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          border: `1.5px solid ${P.border}`, borderRadius: 10,
          padding: "6px 12px", fontSize: 13, fontWeight: 500,
          color: P.textMain, background: P.surface, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = P.primary}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = P.border}
      >
        {value}
        <span style={{ color: P.textFaint, marginLeft: 2, fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
          background: P.surface, border: `1.5px solid ${P.border}`,
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(48,49,61,0.12)", minWidth: 150,
        }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => { onChange(p); setOpen(false); }}
              style={{
                width: "100%", textAlign: "left", padding: "9px 16px",
                fontSize: 13, cursor: "pointer", border: "none",
                background: p === value ? P.primaryFaint : "transparent",
                color: p === value ? P.primary : P.textMain,
                fontWeight: p === value ? 600 : 400,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (p !== value) e.currentTarget.style.background = P.primaryFaint; }}
              onMouseLeave={(e) => { if (p !== value) e.currentTarget.style.background = "transparent"; }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${P.primaryDim}`,
        borderTopColor: P.primary, borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── ErrorBanner ────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      borderRadius: 12, border: "1.5px solid #FFCDD2", background: "#FFF5F5",
      padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span style={{ fontSize: 13, color: "#C62828" }}>{message}</span>
      <button onClick={onRetry} style={{ fontSize: 12, color: "#C62828", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
        Retry
      </button>
    </div>
  );
}

// ── Chart helpers ──────────────────────────────────────────────────────────
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
      backgroundColor: P.base,
      borderColor: P.baseMid,
      borderWidth: 1,
      titleColor: P.textFaint,
      bodyColor: "#fff",
      padding: 10,
      callbacks: { label: (c) => ` ${c.parsed.y} visitors` },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(48,49,61,0.05)", drawBorder: false },
      ticks: { color: P.textFaint, font: { size: 11 }, maxRotation: 0, maxTicksLimit: 10 },
      border: { display: false },
    },
    y: {
      min: 0,
      grid: { color: "rgba(48,49,61,0.05)", drawBorder: false },
      ticks: { color: P.textFaint, font: { size: 11 }, stepSize: 1 },
      border: { display: false },
    },
  },
};

// ── SortIcon ───────────────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <FaSort style={{ color: P.textFaint, marginLeft: 4, display: "inline" }} />;
  return sortDir === "asc"
    ? <FaSortUp   style={{ color: P.primary, marginLeft: 4, display: "inline" }} />
    : <FaSortDown style={{ color: P.primary, marginLeft: 4, display: "inline" }} />;
}

// ── UsersTable ─────────────────────────────────────────────────────────────
function UsersTable({ users = [] }) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("lastSeen");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

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

  const thStyle = {
    padding: "10px 16px", textAlign: "left", fontSize: 11,
    fontWeight: 700, color: P.textSub, cursor: "pointer",
    userSelect: "none", whiteSpace: "nowrap",
    letterSpacing: "0.05em", textTransform: "uppercase",
  };
  const tdStyle = { padding: "12px 16px" };

  return (
    <div style={{ borderRadius: 16, border: `1.5px solid ${P.border}`, overflow: "hidden", background: P.surface }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: `1.5px solid ${P.border}`, gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FaUser style={{ color: P.primary, fontSize: 13 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: P.textMain }}>Users</span>
          <span style={{
            fontSize: 11, color: P.textSub, background: P.primaryFaint,
            borderRadius: 99, padding: "2px 8px", fontVariantNumeric: "tabular-nums",
            border: `1px solid ${P.primaryDim}`,
          }}>
            {filtered.length}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <FaSearch style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: P.textFaint, fontSize: 11, pointerEvents: "none",
          }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search name, email, ID…"
            style={{
              paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              fontSize: 12, border: `1.5px solid ${P.border}`, borderRadius: 10,
              color: P.textMain, outline: "none", width: 210,
              transition: "border-color 0.15s", background: P.surface,
            }}
            onFocus={(e) => e.target.style.borderColor = P.primary}
            onBlur={(e) => e.target.style.borderColor = P.border}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: P.surfaceAlt, borderBottom: `1.5px solid ${P.border}` }}>
            <tr>
              <th style={thStyle} onClick={() => toggleSort("name")}>
                <FaUser style={{ display: "inline", marginRight: 6, color: P.textFaint, fontSize: 11 }} />
                Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th style={thStyle} onClick={() => toggleSort("email")}>
                <FaEnvelope style={{ display: "inline", marginRight: 6, color: P.textFaint, fontSize: 11 }} />
                Email <SortIcon col="email" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th style={thStyle} onClick={() => toggleSort("visits")}>
                Visits <SortIcon col="visits" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th style={thStyle} onClick={() => toggleSort("lastSeen")}>
                Last Seen <SortIcon col="lastSeen" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th style={{ ...thStyle, cursor: "default" }}>Location</th>
              <th style={{ ...thStyle, cursor: "default" }}>Browser / OS</th>
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderTop: i > 0 ? `1px solid ${P.border}` : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = P.primaryFaint}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={u.name} />
                      <span style={{ fontSize: 13, color: P.textMain, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                        {u.name || <span style={{ color: P.textFaint, fontStyle: "italic", fontWeight: 400 }}>Anonymous</span>}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: P.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 180 }}>
                      {u.email || <span style={{ color: P.textFaint, fontStyle: "italic" }}>—</span>}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: P.primary, fontVariantNumeric: "tabular-nums" }}>
                      {u.visits ?? "—"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: P.textSub, whiteSpace: "nowrap" }}>{fmtDate(u.lastSeen)}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13, color: P.textSub, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{getFlag(u.country)}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{u.country || "—"}</span>
                      </span>
                      {u.city && (
                        <span style={{ fontSize: 11, color: P.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{u.city}</span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: P.textSub }}>
                        {getBrowserIcon(u.browser)}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{u.browser || "—"}</span>
                      </span>
                      {u.os && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: P.textFaint }}>
                          {getOSIcon(u.os)}
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{u.os}</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: P.textFaint }}>
                  {search ? "No users match your search." : "No user data available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px", borderTop: `1.5px solid ${P.border}`, background: P.surfaceAlt,
        }}>
          <span style={{ fontSize: 12, color: P.textFaint }}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { label: "←", action: () => setPage((p) => Math.max(0, p - 1)), disabled: page === 0 },
            ].concat(
              Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return { label: pageNum + 1, action: () => setPage(pageNum), active: pageNum === page };
              }),
              [{ label: "→", action: () => setPage((p) => Math.min(totalPages - 1, p + 1)), disabled: page >= totalPages - 1 }]
            ).map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                style={{
                  padding: "4px 10px", fontSize: 12,
                  border: `1.5px solid ${btn.active ? P.primary : P.border}`,
                  borderRadius: 8, cursor: btn.disabled ? "not-allowed" : "pointer",
                  background: btn.active ? P.primary : P.surface,
                  color: btn.active ? "#fff" : btn.disabled ? P.textFaint : P.textSub,
                  opacity: btn.disabled ? 0.35 : 1, transition: "all 0.15s",
                }}
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function AnalyticsComponents({ TRACKER_ID }) {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const [period, setPeriod] = useState("Last 7 days");
  const [leftTab, setLeftTab] = useState("Referrer");
  const [rightTab, setRightTab] = useState("Country");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchStats(selectedPeriod) {
    setLoading(true);
    setError(null);
    try {
      const { fromDate, toDate } = getDateRange(selectedPeriod);
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
        }],
      },
      options: CHART_OPTIONS,
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [data]);

  const leftRows = getLeftRows(data, leftTab);
  const rightRows = getRightRows(data, rightTab);
  const leftMax = Math.max(0, ...leftRows.map((r) => r.value));
  const rightMax = Math.max(0, ...rightRows.map((r) => r.value));

  const card = {
    borderRadius: 16,
    border: `1.5px solid ${P.border}`,
    padding: 20,
    background: P.surface,
  };

  return (
    <div style={{ minHeight: "100vh", background: P.surfaceAlt, padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            border: `1.5px solid ${P.border}`, borderRadius: 10,
            padding: "6px 14px", background: P.surface,
          }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: P.primary, fontWeight: 700 }}>{"</>"}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: P.textMain }}>analytics.sakshamjain.dev</span>
          </div>
          <PeriodDropdown value={period} onChange={setPeriod} />
          <button
            onClick={() => fetchStats(period)}
            disabled={loading}
            style={{
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 10, border: `1.5px solid ${P.border}`, cursor: "pointer",
              color: P.textSub, background: P.surface, fontSize: 16,
              opacity: loading ? 0.5 : 1, transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.primary; e.currentTarget.style.color = P.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSub; }}
          >
            <span style={loading ? { display: "inline-block", animation: "spin 0.7s linear infinite" } : {}}>↻</span>
          </button>
          {data?.bucketMode && (
            <span style={{ fontSize: 12, color: P.textSub, marginLeft: "auto", textTransform: "capitalize" }}>
              Showing {data.bucketMode === "day" ? "daily" : data.bucketMode === "week" ? "weekly" : "monthly"} data
            </span>
          )}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {error && <ErrorBanner message={`Failed to load: ${error}`} onRetry={() => fetchStats(period)} />}

        {/* Stats + Chart */}
        <div style={card}>
          {loading ? <Spinner /> : data && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
                <StatCard label="Visitors"      value={data.totalVisits}       accent={P.primary} />
                <VDivider />
                <StatCard label="Unique"        value={data.uniqueVisitors}    accent={P.baseSoft} />
                <VDivider />
                <StatCard label="Sessions"      value={data.totalSessions} />
                <VDivider />
                <StatCard label="Bounce Rate"   value={data.bounceRate} />
                <VDivider />
                <StatCard label="Avg Time"      value={fmtTime(data.avgTimeSpent)} />
                <VDivider />
                <StatCard label="Pages/visitor" value={data.avgVisitsPerUser} />
              </div>
              <div style={{ marginTop: 20, position: "relative", height: 260 }}>
                <canvas ref={chartRef} />
              </div>
            </>
          )}
        </div>

        {/* Breakdown panels */}
        {!loading && data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { tabs: ["Referrer","Device","Browser","OS"], active: leftTab, onChange: setLeftTab, rows: leftRows, max: leftMax },
              { tabs: ["Country","City","Page"],            active: rightTab, onChange: setRightTab, rows: rightRows, max: rightMax },
            ].map(({ tabs, active, onChange, rows, max }, pi) => (
              <div key={pi} style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <TabBar options={tabs} active={active} onChange={onChange} />
                  <span style={{ fontSize: 11, color: P.textFaint, fontWeight: 600, letterSpacing: "0.04em" }}>VISITORS ↓</span>
                </div>
                <div style={{ borderTop: `1px solid ${P.border}` }}>
                  {rows.length > 0 ? (
                    rows.map((r) => <BarRow key={r.label} {...r} max={max} />)
                  ) : (
                    <p style={{ fontSize: 13, color: P.textFaint, textAlign: "center", padding: "20px 0" }}>No data</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users table */}
        {!loading && data && <UsersTable users={data.users ?? []} />}
      </div>
    </div>
  );
}