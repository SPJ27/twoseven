"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaCopy,
  FaCheck,
  FaGlobe,
  FaCode,
  FaChartBar,
  FaUser,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaBell,
  FaShieldAlt,
  FaKey,
} from "react-icons/fa";
import Navbar from "../Navbar";


function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function useCopy(ms = 1800) {
  const [copied, setCopied] = useState(false);
  function copy(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), ms);
  }
  return [copied, copy];
}

function PrimaryBtn({ children, onClick, sm, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-semibold rounded-xl bg-neutral-800 text-white
        hover:bg-neutral-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${sm ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"}`}
    >
      {children}
    </button>
  );
}
function GhostBtn({ children, onClick, sm, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xl border border-neutral-200
        text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 active:scale-95 transition-all bg-white
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sm ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"}`}
    >
      {children}
    </button>
  );
}
function DangerBtn({ children, onClick, sm }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xl border border-red-200
        bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all
        ${sm ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"}`}
    >
      {children}
    </button>
  );
}
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  readOnly,
  suffix,
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-neutral-500 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div
        className={`flex items-center rounded-xl border transition-colors overflow-hidden
        ${focus ? "border-emerald-400" : "border-neutral-200"} ${readOnly ? "bg-neutral-50" : "bg-white"}`}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="flex-1 border-none outline-none px-3 py-2.5 text-sm text-neutral-800 bg-transparent placeholder:text-neutral-300"
        />
        {suffix && (
          <div className="pr-3 text-neutral-400 text-sm">{suffix}</div>
        )}
      </div>
      {hint && <span className="text-xs text-neutral-400">{hint}</span>}
    </div>
  );
}
function Toggle({ checked, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        {label && <div className="text-sm text-neutral-700">{label}</div>}
        {sub && <div className="text-xs text-neutral-400 mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer flex-shrink-0
          ${checked ? "bg-emerald-500" : "bg-neutral-200"}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function Sparkline({ data }) {
  const W = 300,
    H = 52,
    P = 2;
  const empty = !data || data.every((v) => v === 0);
  if (empty)
    return (
      <div className="h-14 flex items-center">
        <div className="w-full h-px bg-neutral-200" />
      </div>
    );
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = P + (i / (data.length - 1)) * (W - P * 2);
    const y = H - P - (v / max) * (H - P * 2);
    return [x, y];
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const uid = `sp${data[0]}${data.length}${data[data.length - 1]}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 52 }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} />
      <path
        d={line}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModalWrap({ children, onClose, width = 440 }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-900/30 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl shadow-neutral-900/10 animate-[modalIn_.2s_ease]"
        style={{ width, maxWidth: "90vw" }}
      >
        {children}
      </div>
    </div>
  );
}

function NewProjectModal({ onClose, onCreate, loading }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  function handleCreate() {
    if (!domain.trim()) return setError("Domain is required.");
    const clean = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    onCreate({ name: name.trim() || clean, domain: clean });
  }

  return (
    <ModalWrap onClose={onClose}>
      <div className="p-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-base font-extrabold text-neutral-800">
              Add Website
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Start tracking a new domain
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-neutral-500 text-xl leading-none bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            label="Domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setError("");
            }}
            placeholder="yourdomain.com"
            hint="Without https:// — e.g. yourdomain.com"
          />
          <Input
            label="Display Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Website"
          />
          {error && (
            <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-2.5 mt-6 justify-end">
          <GhostBtn onClick={onClose} disabled={loading}>
            Cancel
          </GhostBtn>
          <PrimaryBtn onClick={handleCreate} disabled={loading}>
            {loading ? (
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <FaPlus className="text-[10px]" />
            )}
            {loading ? "Creating…" : "Add Website"}
          </PrimaryBtn>
        </div>
      </div>
    </ModalWrap>
  );
}

function SnippetModal({ project, onClose }) {
  const [copied, copy] = useCopy();
  const snippet = `<script\n  src="https://cdn.trackify.dev/tracker.js"\n  data-tracker-id="${project.id}"\n  data-domain="${project.domain}"\n  defer\n></script>`;
  return (
    <ModalWrap onClose={onClose} width={520}>
      <div className="p-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-base font-extrabold text-neutral-800">
              Install Tracker
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Paste before &lt;/head&gt; on every page
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-neutral-500 text-xl leading-none bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 relative">
          <pre className="text-xs text-neutral-300 font-mono leading-relaxed m-0 whitespace-pre-wrap break-all">
            {snippet}
          </pre>
          <button
            onClick={() => copy(snippet)}
            className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold
              px-2.5 py-1.5 rounded-lg border-none cursor-pointer transition-all
              ${copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-neutral-300 hover:bg-white/20"}`}
          >
            {copied ? (
              <FaCheck className="text-[10px]" />
            ) : (
              <FaCopy className="text-[10px]" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-4 flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 text-xs text-amber-700">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          <span>
            Connected status updates automatically after the first page view is
            received.
          </span>
        </div>
        <div className="flex justify-end mt-5">
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </div>
    </ModalWrap>
  );
}

function DeleteModal({ project, onClose, onDelete }) {
  return (
    <ModalWrap onClose={onClose} width={400}>
      <div className="p-7">
        <div className="text-base font-extrabold text-neutral-800 mb-2">
          Remove Website
        </div>
        <div className="text-sm text-neutral-500 mb-6">
          Remove{" "}
          <span className="font-semibold text-neutral-800">
            {project.domain}
          </span>
          ? All collected data will be permanently deleted.
        </div>
        <div className="flex gap-2.5 justify-end">
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <DangerBtn
            onClick={() => {
              onDelete(project.id);
              onClose();
            }}
          >
            <FaTrash className="text-[10px]" /> Remove
          </DangerBtn>
        </div>
      </div>
    </ModalWrap>
  );
}

function ProjectCard({ project, onDelete, onSnippet }) {
  const [hover, setHover] = useState(false);
  const [menu, setMenu] = useState(false);
  return (
    <Link
      href={`/analytics/${project.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setMenu(false);
      }}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer relative
        ${hover ? "border-neutral-300 shadow-lg shadow-neutral-200/60" : "border-neutral-200 shadow-sm shadow-neutral-100/40"}`}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
            ${project.connected ? "bg-emerald-100" : "bg-neutral-100"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${project.connected ? "bg-emerald-500" : "bg-neutral-400"}`}
            />
          </div>
          <span className="text-[15px] font-bold text-neutral-800 truncate">
            {project.domain}
          </span>
        </div>
        <div
          className="relative flex-shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenu((v) => !v)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm
              transition-all bg-transparent border-none cursor-pointer
              ${menu ? "bg-neutral-100 text-neutral-600" : `text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50 ${hover ? "opacity-100" : "opacity-0"}`}`}
          >
            ⋯
          </button>
          {menu && (
            <div
              className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-200
              rounded-xl shadow-xl overflow-hidden min-w-[148px]"
            >
              <button
                onClick={() => setMenu(false)}
                className="flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm text-neutral-600
                  hover:bg-neutral-50 bg-transparent border-none cursor-pointer"
              >
                <FaChartBar className="text-[10px] text-neutral-400" />{" "}
                Analytics
              </button>
              <button
                onClick={() => {
                  setMenu(false);
                  onSnippet(project);
                }}
                className="flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm text-neutral-600
                  hover:bg-neutral-50 bg-transparent border-none cursor-pointer"
              >
                <FaCode className="text-[10px] text-neutral-400" /> Get snippet
              </button>
              <div className="h-px bg-neutral-100" />
              <button
                onClick={() => {
                  setMenu(false);
                  onDelete(project);
                }}
                className="flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm text-red-500
                  hover:bg-red-50 bg-transparent border-none cursor-pointer"
              >
                <FaTrash className="text-[10px]" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-2">
        <Sparkline data={project.graph} />
      </div>
      <div className="px-5 pb-5 pt-2 flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {project.connected ? (
            <>
              <b className="text-neutral-700 tabular-nums">
                {fmtNum(project.visits)}
              </b>{" "}
              visitors
            </>
          ) : (
            <span className="text-neutral-400 text-xs">Not connected yet</span>
          )}
        </span>
        {project.trend !== 0 && (
          <span
            className={`text-[11px] font-bold rounded-full px-2 py-0.5 border
            ${
              project.trend > 0
                ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                : "text-red-500 bg-red-50 border-red-200"
            }`}
          >
            {project.trend > 0 ? "↑" : "↓"}
            {Math.abs(project.trend)}%
          </span>
        )}
      </div>
    </Link>
  );
}

function ProjectsPage({
  initialProjects,
  userEmail,
  onAddWebsite,
  showAddModal,
  onAddModalClose,
}) {
  const [projects, setProjects] = useState(initialProjects ?? []);
  const [snippet, setSnippet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate(data) {
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setProjects((p) => [...p, json.data]);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
      onAddModalClose();
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="flex items-center justify-end mb-8">
        <PrimaryBtn onClick={onAddWebsite}>
          <FaPlus className="text-[10px]" /> Website
        </PrimaryBtn>
      </div>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={setDeleteTarget}
              onSnippet={setSnippet}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-16 text-center">
          <FaChartBar className="text-4xl text-emerald-200 mx-auto mb-4" />
          <div className="text-sm font-bold text-neutral-700 mb-1">
            No websites yet
          </div>
          <div className="text-xs text-neutral-400 mb-5">
            Add your first website to start tracking visitors
          </div>
          <PrimaryBtn onClick={onAddWebsite}>
            <FaPlus className="text-[10px]" /> Add Website
          </PrimaryBtn>
        </div>
      )}
      {snippet && (
        <SnippetModal project={snippet} onClose={() => setSnippet(null)} />
      )}
      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={(id) => setProjects((ps) => ps.filter((p) => p.id !== id))}
        />
      )}
      {showAddModal && (
        <NewProjectModal
          onClose={onAddModalClose}
          onCreate={handleCreate}
          loading={creating}
        />
      )}
    </div>
  );
}



export default function Dashboard({ projects, user }) {
  const [page, setPage] = useState("projects");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div
      className="min-h-screen bg-neutral-50"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      
      <Navbar page={page} setPage={setPage} user={user} />

      <main>
        {page === "projects" && (
          <ProjectsPage
            initialProjects={projects}
            userEmail={user.email}
            showAddModal={showAdd}
            onAddWebsite={() => setShowAdd(true)}
            onAddModalClose={() => setShowAdd(false)}
          />
        )}
        {page === "settings" && <SettingsPage user={user} />}
      </main>
    </div>
  );
}
