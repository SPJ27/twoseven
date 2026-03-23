"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaBell,
  FaChartBar,
  FaCheck,
  FaCopy,
  FaCode,
  FaCog,
  FaEnvelope,
  FaFileAlt,
  FaUser,
  FaPlug,
  FaShieldAlt,
  FaTimes,
  FaUsers,
  FaDumpster,
  FaTrash,
  FaPlus,
  FaCrown,
  FaUserSlash,

  FaKey,
} from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
const NAV_ITEMS = [
  { id: "general", label: "General", icon: <FaCog /> },
  // { id: "revenue",      label: "Revenue",      icon: <FaDollarSign /> },
  { id: "team", label: "Team", icon: <FaUsers /> },
  // { id: "import",       label: "Import",       icon: <FaFileImport /> },
  // { id: "reports", label: "Reports", icon: <FaFileAlt /> },
  // { id: "alerts",       label: "Alerts",       icon: <FaBell /> },
  // { id: "widgets", label: "Widgets", icon: <FaChartBar /> },
  // { id: "integrations", label: "Integrations", icon: <FaPlug /> },
  { id: "api", label: "API", icon: <FaCode /> },
  // { id: "exclusions",   label: "Exclusions",   icon: <FaTimes /> },
  { id: "delete", label: "Delete", icon: <FaDumpster /> },
];

function useCopy(ms = 1800) {
  const [copied, setCopied] = useState(false);
  function copy(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), ms);
  }
  return [copied, copy];
}

function CodeBlock({ code }) {
  const [copied, copy] = useCopy();
  return (
    <div className="relative rounded-md overflow-hidden">
      <SyntaxHighlighter
        language="html"
        style={oneDark}
        customStyle={{
          borderRadius: "0.75rem",
          padding: "1.25rem",
          fontSize: "0.8rem",
          lineHeight: "1.75",
          margin: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => copy(code)}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-colors"
      >
        {copied ? (
          <FaCheck className="text-[10px]" />
        ) : (
          <FaCopy className="text-[10px]" />
        )}
      </button>
    </div>
  );
}

function GeneralPage({ domain, setDomain, domain_, id, darkmode = false }) {
  const [localhost, setLocalhost] = useState(false);
  const [saved, setSaved] = useState(false);

  const scriptCode = `<script\n  data-tracker-id="${id}"\n  data-domain="${domain}"\n  strategy="afterInteractive" \n  ${localhost ? `data-allow-localhost="true" \n  data-debug="true" \n  ` : ""}src="https://twoseven.sakshamjain.dev/tracker.js">\n</script>`;

  const card = darkmode
    ? "border-neutral-800 bg-neutral-800"
    : "border-neutral-200 bg-white";
  const textMain = darkmode ? "text-white" : "text-neutral-900";
  const textSub = darkmode ? "text-white" : "text-neutral-500";
  const textBody = darkmode ? "text-white" : "text-neutral-700";
  const inputCls = darkmode
    ? "bg-neutral-800 border-neutral-600 text-neutral-100 focus:border-neutral-400 placeholder:text-neutral-500"
    : "bg-white border-neutral-200 text-neutral-800 focus:border-neutral-400";

  return (
    <div className="space-y-4 max-w-3xl">
      <div className={`border rounded-md p-6 ${card}`}>
        <p className={`text-sm leading-relaxed mb-4 ${textBody}`}>
          Paste this snippet in the{" "}
          <code
            className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${darkmode ? "bg-neutral-700 text-neutral-300" : "bg-neutral-100 text-neutral-700"}`}
          >
            &lt;head&gt;
          </code>{" "}
          of your website. If you need more help, see our{" "}
          <a
            href="#"
            className={`underline underline-offset-2 ${darkmode ? "text-neutral-200 decoration-neutral-500" : "text-neutral-900 decoration-neutral-300"}`}
          >
            installation guides
          </a>
          . If you need to customize the script, see the{" "}
          <a
            href="#"
            className={`underline underline-offset-2 ${darkmode ? "text-neutral-200 decoration-neutral-500" : "text-neutral-900 decoration-neutral-300"}`}
          >
            script configuration reference
          </a>
          .
        </p>

        <label
          className={`flex items-center gap-2.5 text-sm cursor-pointer mb-4 w-fit select-none ${darkmode ? "text-neutral-300" : "text-neutral-600"}`}
          onClick={() => setLocalhost(!localhost)}
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${darkmode ? "border-neutral-500 bg-neutral-700" : "border-neutral-300 bg-white"}`}
          >
            {localhost && (
              <FaCheck
                className={`text-[8px] ${darkmode ? "text-neutral-200" : "text-neutral-700"}`}
              />
            )}
          </div>
          Allow localhost debugging
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold cursor-default ${darkmode ? "bg-neutral-600 text-neutral-400" : "bg-neutral-200 text-neutral-500"}`}
          >
            ?
          </span>
        </label>

        <CodeBlock code={scriptCode} />

        <p className={`mt-4 text-sm ${textSub}`}>
          Tip:{" "}
          <a
            href="#"
            className={`underline underline-offset-2 hover:opacity-80 ${darkmode ? "text-neutral-400 decoration-neutral-600" : "text-neutral-500 decoration-neutral-300"}`}
          >
            proxy the script through your own domain
          </a>{" "}
          to avoid ad blockers.
        </p>
      </div>

      <div className={`border rounded-md p-6 ${card}`}>
        <h3 className={`text-base font-bold mb-1 ${textMain}`}>Domain</h3>
        <p className={`text-sm leading-relaxed mb-4 ${textSub}`}>
          Your main website domain for analytics tracking. All subdomains will
          be tracked automatically.
        </p>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-colors ${inputCls}`}
          placeholder="yourdomain.com"
        />
        <p className={`mt-2 text-xs ${textSub}`}>
          Your public TwoSeven ID is{" "}
          <span
            className={`font-mono font-medium ${darkmode ? "text-neutral-300" : "text-neutral-500"}`}
          >
            {id}
          </span>
        </p>
        <div className="flex justify-end mt-5">
          <button
            onClick={() => {
              fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, domain }),
              });
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            disabled={domain === domain_}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${
              domain === domain_
                ? darkmode
                  ? "bg-neutral-700 border-neutral-600 text-neutral-500 cursor-not-allowed"
                  : "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                : "bg-neutral-800 border-neutral-800 text-white font-semibold cursor-pointer hover:bg-neutral-900"
            }`}
          >
            {saved && <FaCheck className="text-[10px]" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamPage({ id, darkmode = false }) {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);

  const border = darkmode ? "border-neutral-700" : "border-[#E4E5ED]";
  const textPrimary = darkmode ? "text-white" : "text-[#30313D]";
  const textMuted = darkmode ? "text-neutral-400" : "text-[#6B6D80]";
  const textSubtle = darkmode ? "text-neutral-500" : "text-[#9B9DAF]";
  const surface = darkmode ? "bg-neutral-900" : "bg-[#F7F8F9]";
  const cardBg = darkmode ? "bg-neutral-800 border-neutral-700" : "bg-white border-[#E4E5ED]";
  const inputCls = darkmode
    ? "bg-neutral-700 text-white border-neutral-600 placeholder:text-neutral-500"
    : "bg-white text-[#30313D] border-[#E4E5ED] placeholder:text-[#9B9DAF]";

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin?trackerId=${id}`);
      const json = await res.json();
      setTeamData(json);
    } catch (e) {
      console.error("Failed to fetch team:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTeam(); }, [id]);

  async function handleAdd() {
    if (!email.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin?trackerId=${id}&email=${email.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin: true }),
        },
      );
      const json = await res.json();
      if (json.error) { setError(json.error); return; }
      setEmail("");
      await fetchTeam();
    } catch (e) {
      setError("Failed to add admin.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(adminEmail) {
    setRemoving(adminEmail);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin?trackerId=${id}&email=${adminEmail}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin: false }),
        },
      );
      await fetchTeam();
    } catch (e) {
      console.error("Failed to remove admin:", e);
    } finally {
      setRemoving(null);
    }
  }

  // Combine creator + admins into one flat list for the table
  const allMembers = [];
  if (teamData?.creatorEmail) {
    allMembers.push({ email: teamData.creatorEmail, name: teamData.creatorName, role: "owner" });
  }
  if (teamData?.admins) {
    for (const a of teamData.admins) {
      if (a?.email) allMembers.push({ email: a.email, name: a.name, role: "admin" });
    }
  }

  return (
    <div className={`rounded-md border overflow-hidden ${cardBg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${border} gap-3 flex-wrap`}>
        <div className="flex items-center gap-2">
          <FaUsers className="text-[#06AB78] text-[13px]" />
          <span className={`text-[13px] font-bold ${textPrimary}`}>Team</span>
          <span className={`text-[11px] ${textMuted} bg-[rgba(6,171,120,0.07)] rounded-full px-2 py-0.5 tabular-nums border border-[rgba(6,171,120,0.15)]`}>
            {allMembers.length}
          </span>
        </div>
        {/* Add input */}
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[11px] text-red-500">{error}</span>
          )}
          <div className="relative">
            <FaEnvelope className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${textSubtle} text-[11px] pointer-events-none`} />
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="teammate@email.com"
              className={`pl-8 pr-3 py-1.5 text-xs border rounded-sm outline-none w-[210px] transition-colors ${inputCls}`}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-[#06AB78] text-white hover:bg-[#048059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding
              ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <FaPlus className="text-[9px]" />
            }
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className={`border-b ${border} ${surface}`}>
            <tr>
              <th className={`px-4 py-2.5 text-left text-[11px] font-bold ${textMuted} whitespace-nowrap tracking-[0.05em] uppercase`}>
                <FaUser className={`inline mr-1.5 ${textSubtle} text-[11px]`} />Name
              </th>
              <th className={`px-4 py-2.5 text-left text-[11px] font-bold ${textMuted} whitespace-nowrap tracking-[0.05em] uppercase`}>
                <FaEnvelope className={`inline mr-1.5 ${textSubtle} text-[11px]`} />Email
              </th>
              <th className={`px-4 py-2.5 text-left text-[11px] font-bold ${textMuted} whitespace-nowrap tracking-[0.05em] uppercase`}>Role</th>
              <th className={`px-4 py-2.5 text-left text-[11px] font-bold ${textMuted} whitespace-nowrap tracking-[0.05em] uppercase`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <div className="w-6 h-6 border-[3px] border-[rgba(6,171,120,0.15)] border-t-[#06AB78] rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : allMembers.length > 0 ? (
              allMembers.map((member, i) => (
                <tr
                  key={member.email}
                  className={`transition-colors hover:bg-[rgba(6,171,120,0.07)] ${i > 0 ? `border-t ${border}` : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name || member.email} darkmode={darkmode} />
                      <span className={`text-[13px] font-semibold truncate max-w-[140px] ${textPrimary}`}>
                        {member.name || <span className={`${textMuted} italic font-normal`}>—</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] ${textMuted} truncate block max-w-[200px]`}>
                      {member.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {member.role === "owner" ? (
                      <span className="text-[11px] font-semibold border px-2 py-0.5 text-white bg-orange-400 rounded-lg flex items-center gap-1 w-fit">
                        <FaCrown className="text-[10px]" /> Owner
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold rounded-lg border px-2 py-0.5 w-fit text-[#06AB78] bg-[rgba(6,171,120,0.08)] border-[rgba(6,171,120,0.25)]">
                        <FaShieldAlt className="text-[9px]" /> Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {member.role === "admin" && (
                      <button
                        onClick={() => handleRemove(member.email)}
                        disabled={removing === member.email}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-full border px-2 py-0.5 transition-colors disabled:opacity-50 ${
                          darkmode
                            ? "text-red-400 border-red-800 bg-[rgba(198,40,40,0.08)] hover:bg-[rgba(198,40,40,0.18)]"
                            : "text-[#C62828] border-[rgba(198,40,40,0.25)] bg-[rgba(198,40,40,0.06)] hover:bg-[rgba(198,40,40,0.12)]"
                        }`}
                      >
                        {removing === member.email
                          ? <span className="w-3 h-3 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
                          : <FaUserSlash className="text-[9px]" />
                        }
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={`px-4 py-10 text-center text-[13px] ${textSubtle}`}>
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiPage({ id, darkmode = false }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const card = darkmode
    ? "border-neutral-800 bg-neutral-800"
    : "border-neutral-200 bg-white";
  const textMain = darkmode ? "text-white" : "text-neutral-900";
  const textSub = darkmode ? "text-white" : "text-neutral-500";
  const textMono = darkmode
    ? "text-neutral-300 bg-neutral-700"
    : "text-neutral-700 bg-neutral-100";
  const rowBorder = darkmode ? "border-neutral-700" : "border-neutral-100";

  useEffect(() => {
    async function fetchKeys() {
      setLoading(true);
      try {
        const res = await fetch(`/api/keys?tracker_id=${id}`);
        const json = await res.json();
        if (json.success) setKeys(json.data ?? []);
      } catch (e) {
        console.error("Failed to fetch keys:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchKeys();
  }, [id]);

  async function handleCreate() {
    setCreating(true);
    setNewKey(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracker_id: id }),
      });
      const json = await res.json();
      if (json.success) {
        setNewKey(json.key);
        // Refresh list
        const listRes = await fetch(`/api/keys?tracker_id=${id}`);
        const listJson = await listRes.json();
        if (listJson.success) setKeys(listJson.data ?? []);
      }
    } catch (e) {
      alert("Only the project creator can create API keys.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(keyId) {
    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyId }),
      });
      const json = await res.json();
      if (json.success) setKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch (e) {
      console.error("Failed to delete key:", e);
    }
  }

  function copyKey(key, keyId) {
    navigator.clipboard?.writeText(key).catch(() => {});
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 1800);
  }

  function fmtDate(ts) {
    if (!ts) return "Never";
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header card */}
      <div className={`border rounded-md p-6 ${card}`}>
        <div className="flex items-start justify-between mb-1">
          <h3 className={`text-base font-bold ${textMain}`}>API Keys</h3>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 text-white hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <FaPlus className="text-[9px]" />
            )}
            {creating ? "Creating…" : "New key"}
          </button>
        </div>
        <p className={`text-sm mb-5 ${textSub}`}>
          Use API keys to access your analytics data programmatically. Keys are
          scoped to this tracker only.
        </p>

        {/* Newly created key banner */}
        {newKey && (
          <div className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-700 mb-1.5">
              ✓ Key created — copy it now, it won't be shown again in full.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-emerald-800 bg-emerald-100 px-3 py-2 rounded-lg break-all">
                {newKey}
              </code>
              <button
                onClick={() => copyKey(newKey, "new")}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-700 transition-colors"
              >
                {copiedId === "new" ? (
                  <FaCheck className="text-[10px]" />
                ) : (
                  <FaCopy className="text-[10px]" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-500 animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className={`text-center py-8 text-sm ${textSub}`}>
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <div
            className={`rounded-lg border divide-y overflow-hidden ${darkmode ? "border-neutral-700 divide-neutral-700" : "border-neutral-200 divide-neutral-100"}`}
          >
            {keys.map((k) => (
              <div
                key={k.id}
                className={`flex items-center gap-3 px-4 py-3 ${darkmode ? "bg-neutral-800" : "bg-white"}`}
              >
                <FaKey
                  className={`text-[11px] shrink-0 ${darkmode ? "text-neutral-500" : "text-neutral-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <code
                    className={`text-xs font-mono px-2 py-0.5 rounded-md ${textMono}`}
                  >
                    {k.key.slice(0, 12)}••••••••••••••••••••
                  </code>
                  <div className={`text-[11px] mt-0.5 ${textSub}`}>
                    Created {fmtDate(k.created_at)} · Last used{" "}
                    {fmtDate(k.last_used_at)}
                  </div>
                </div>
                <button
                  onClick={() => copyKey(k.key, k.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                    darkmode
                      ? "hover:bg-neutral-700 text-neutral-400"
                      : "hover:bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {copiedId === k.id ? (
                    <FaCheck className="text-[10px] text-emerald-500" />
                  ) : (
                    <FaCopy className="text-[10px]" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(k.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                    darkmode
                      ? "hover:bg-red-900/40 text-red-400"
                      : "hover:bg-red-50 text-red-400"
                  }`}
                >
                  <FaTrash className="text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage card */}
      <div className={`border rounded-md p-6 ${card}`}>
        <h3 className={`text-base font-bold mb-1 ${textMain}`}>Usage</h3>
        <p className={`text-sm mb-4 ${textSub}`}>
          Pass your API key as a Bearer token in the Authorization header.
        </p>
        <CodeBlock
          code={`fetch("https://twoseven.sakshamjain.dev/api/stats?id=${id}", {\n  headers: {\n    "Authorization": "Bearer ts_your_api_key_here"\n  }\n})`}
        />
        <p className={`mt-3 text-xs ${textSub}`}>
          The key is scoped to this tracker only. Requests with a key for a
          different tracker will be rejected.
        </p>
      </div>
    </div>
  );
}

function PlaceholderPage({ label, darkmode = false }) {
  return (
    <div
      className={`border rounded-2xl p-8 text-sm text-neutral-400 max-w-2xl ${
        darkmode
          ? "border-neutral-700 bg-neutral-800"
          : "border-neutral-200 bg-white"
      }`}
    >
      {label} settings coming soon.
    </div>
  );
}

const Settings = ({ id, domain: domain_, darkmode = false }) => {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("general");
  const [domain, setDomain] = useState(domain_);
  const currentItem = NAV_ITEMS.find((n) => n.id === activeNav);

  return (
    <div className="px-50 py-13">
      <Link
        href={`/analytics/${id}`}
        className={`inline-flex items-center gap-1.5 font-semibold text-sm transition-colors mb-3 border rounded-lg px-2 py-1 shadow-sm ${
          darkmode
            ? "text-neutral-200 border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
            : "text-neutral-800 border-neutral-300 bg-white hover:text-neutral-900"
        }`}
      >
        ← Back
      </Link>

      <h1
        className={`text-2xl font-bold mb-4 ${darkmode ? "text-white" : "text-neutral-800"}`}
      >
        Settings for {domain}
      </h1>

      <div className="flex h-screen font-sans">
        <aside className="w-56 shrink-0 py-5">
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full whitespace-nowrap flex items-center gap-3 px-4 py-2 text-md rounded-lg text-left transition-all ${
                  activeNav === item.id
                    ? item.id === "delete"
                      ? "bg-red-600 text-white font-semibold"
                      : "bg-neutral-800 text-white font-semibold"
                    : item.id === "delete"
                      ? darkmode
                        ? "text-red-400 hover:bg-red-900/40 hover:text-red-300 font-medium"
                        : "text-red-500 hover:bg-red-50 hover:text-red-600 font-medium"
                      : darkmode
                        ? "text-neutral-300 hover:bg-neutral-800 hover:text-white font-medium"
                        : "text-neutral-800 hover:bg-neutral-800 hover:text-white font-medium"
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-10 py-5">
          {activeNav === "general" ? (
            <GeneralPage
              domain={domain}
              setDomain={setDomain}
              id={id}
              domain_={domain_}
              darkmode={darkmode}
            />
          ) : activeNav === "api" ? (
            <ApiPage id={id} darkmode={darkmode} />
          ) : activeNav === "delete" ? (
            <div
              className={`border rounded-2xl p-8 text-sm text-red-500 max-w-2xl ${
                darkmode
                  ? "border-red-900 bg-neutral-800"
                  : "border-red-200 bg-white"
              }`}
            >
              <h3 className="text-base font-bold text-red-500 mb-2">
                Delete Project
              </h3>
              <p
                className={`text-sm mb-5 ${darkmode ? "text-neutral-400" : "text-neutral-500"}`}
              >
                This action cannot be undone. This will permanently delete all
                data associated with this project, including all analytics data
                and settings.
              </p>
              <button
                onClick={async () => {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/api/delete`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id }),
                    },
                  );
                  const data = await response.json();
                  if (data.error) {
                    alert(
                      data.error === "Unauthorized"
                        ? "Only the creator can delete this project."
                        : "Error: " + data.error,
                    );
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-red-500 bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Delete project
              </button>
            </div>
          ) : activeNav === "team" ? (
            <TeamPage id={id} darkmode={darkmode} />
          ) : (
            <PlaceholderPage label={currentItem?.label} darkmode={darkmode} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
