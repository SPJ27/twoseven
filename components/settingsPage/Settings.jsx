"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FaBell,
  FaChartBar,
  FaCheck,
  FaCopy,
  FaCode,
  FaCog,
  FaDollarSign,
  FaFileAlt,
  FaFileImport,
  FaPlug,
  FaShieldAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const NAV_ITEMS = [
  { id: "general", label: "General", icon: <FaCog /> },
  { id: "revenue", label: "Revenue", icon: <FaDollarSign /> },
  { id: "team", label: "Team", icon: <FaUsers /> },
  { id: "import", label: "Import", icon: <FaFileImport /> },
  { id: "reports", label: "Reports", icon: <FaFileAlt /> },
  { id: "alerts", label: "Alerts", icon: <FaBell /> },
  { id: "widgets", label: "Widgets", icon: <FaChartBar /> },
  { id: "integrations", label: "Integrations", icon: <FaPlug /> },
  { id: "api", label: "API", icon: <FaCode /> },
  { id: "exclusions", label: "Exclusions", icon: <FaTimes /> },
  { id: "security", label: "Security", icon: <FaShieldAlt /> },
];

// const INSTALL_TABS = [
//   {
//     id: "script",
//     label: "Script",
//     icon: (
//       <span className="font-mono text-neutral-500 text-xs font-semibold">
//         &lt;/&gt;
//       </span>
//     ),
//   }
// ];

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
    <div className="relative rounded-xl overflow-hidden">
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

function GeneralPage({ domain, setDomain, domain_, id }) {
  const [activeTab, setActiveTab] = useState("script");
  const [localhost, setLocalhost] = useState(false);
  const [saved, setSaved] = useState(false);

  const scriptCode = `<script\n  data-tracker-id="${id}"\n  data-domain="${domain}"\n  strategy="afterInteractive" \n  ${localhost ? `data-allow-localhost="true" \n  data-debug="true" \n  ` : ""}src="https://datafa.st/js/script.js">\n</script>`;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Snippet card */}
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        {/* Install tabs — each is its own bordered button */}
        {/* <div className="flex gap-2 mb-"> */}
        {/* {INSTALL_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-all font-medium
                ${
                  activeTab === t.id
                    ? "border-neutral-300 bg-white text-neutral-900 shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-400 hover:text-neutral-600 hover:border-neutral-300"
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))} */}
        {/* </div> */}

        <p className="text-sm text-neutral-700 leading-relaxed mb-4">
          Paste this snippet in the{" "}
          <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded-md font-mono text-neutral-700">
            &lt;head&gt;
          </code>{" "}
          of your website. If you need more help, see our{" "}
          <a
            href="#"
            className="text-neutral-900 underline underline-offset-2 decoration-neutral-300"
          >
            installation guides
          </a>{" "}
          . If you need to customize the script, see the{" "}
          <a
            href="#"
            className="text-neutral-900 underline underline-offset-2 decoration-neutral-300"
          >
            script configuration reference
          </a>{" "}
          .
        </p>

        <label
          className="flex items-center gap-2.5 text-sm text-neutral-600 cursor-pointer mb-4 w-fit select-none"
          onClick={() => setLocalhost(!localhost)}
        >
          <div className="w-4 h-4 rounded border border-neutral-300 bg-white flex items-center justify-center flex-shrink-0">
            {localhost && <FaCheck className="text-neutral-700 text-[8px]" />}
          </div>
          Allow localhost debugging
          <span className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-[9px] font-bold cursor-default">
            ?
          </span>
        </label>

        <CodeBlock code={scriptCode} />

        <p className="mt-4 text-sm text-neutral-400">
          Tip:{" "}
          <a
            href="#"
            className="text-neutral-500 underline underline-offset-2 decoration-neutral-300 hover:text-neutral-700"
          >
            proxy the script through your own domain
          </a>{" "}
          to avoid ad blockers.
        </p>
      </div>

      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-base font-bold text-neutral-900 mb-1">Domain</h3>
        <p className="text-sm text-neutral-500 leading-relaxed mb-4">
          Your main website domain for analytics tracking. All subdomains will
          be tracked automatically.
        </p>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 outline-none focus:border-neutral-400 bg-white text-neutral-800 transition-colors"
          placeholder="yourdomain.com"
        />
        <p className="mt-2 text-xs text-neutral-400">
          Your public DataFast ID is{" "}
          <span className="font-mono font-medium text-neutral-500">
            dfid_hJKIQ22rKEtoo2AVlNSHn
          </span>
        </p>
        <div className="flex justify-end mt-5">
          <button
            onClick={() => {
              fetch('/api/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, domain }),
              });
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            disabled={domain === domain_}
            className={`px-4 py-1.5 text-sm font-medium  rounded-lg border border-neutral-200 ${domain === domain_ ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : "bg-neutral-800 text-white font-semibold cursor-pointer hover:bg-neutral-900"} transition-colors flex items-center gap-2`}
          >
            {saved && <FaCheck className="text-neutral-500 text-[10px]" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ label }) {
  return (
    <div className="border border-neutral-200 rounded-2xl p-8 bg-white text-sm text-neutral-400 max-w-2xl">
      {label} settings coming soon.
    </div>
  );
}

const Settings = ({ id, domain: domain_ }) => {

  const [activeNav, setActiveNav] = useState("general");
  let [domain, setDomain] = useState(domain_);
  const currentItem = NAV_ITEMS.find((n) => n.id === activeNav);

  return (
    <div className="px-50 py-13">
      <Link href={`/analytics/${id}`} className="inline-flex items-center gap-1.5 font-semibold text-sm text-neutral-800 hover:text-neutral-800 transition-colors mb-3 border border-neutral-300 bg-white rounded-lg px-2 py-1 shadow-sm">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold text-neutral-800 mb-4 ">
        Settings for {domain}
      </h1>

      <div className="flex h-screen font-sans ">
        <aside className="w-56 shrink-0 py-5">
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full whitespace-nowrap flex items-center gap-3 px-4 py-2  text-md rounded-lg text-left transition-all
                ${
                  activeNav === item.id
                    ? "bg-neutral-800 text-white font-semibold"
                    : "text-neutral-800 hover:bg-neutral-800 hover:text-white font-medium"
                }`}
              >
                <span className={`text-xs`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 px-10 py-5">
          {activeNav === "general" ? (
            <GeneralPage domain={domain} setDomain={setDomain} id={id} domain_={domain_}/>
          ) : (
            <PlaceholderPage label={currentItem?.label} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
