!(function (t) {
  "use strict";

  if (!t) {
    console.warn("[tracker] document.currentScript is null. Tracking stopped.");
    return;
  }

  var TRACKER_ID  = t.getAttribute("data-tracker-id") || "";
  var DOMAIN      = t.getAttribute("data-domain") || "";
  var ALLOW_LOCAL = t.getAttribute("data-allow-localhost") === "true";
  var DEBUG       = t.getAttribute("data-debug") === "true";
  var CUSTOM_API  = t.getAttribute("data-api-url") || "";
  t = null;

  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------

  function log()  { if (DEBUG) console.log.apply(console,  ["[tracker]"].concat([].slice.call(arguments))); }
  function warn() { if (DEBUG) console.warn.apply(console, ["[tracker]"].concat([].slice.call(arguments))); }

  // ---------------------------------------------------------------------------
  // API URL
  // ---------------------------------------------------------------------------

  var API_URL;
  try {
    API_URL = new URL(CUSTOM_API || "https://twoseven.sakshamjain.dev/api/track", window.location.origin).href;
  } catch (e) {
    API_URL = "https://twoseven.sakshamjain.dev/api/track";
  }

  // ---------------------------------------------------------------------------
  // Enable / disable
  // ---------------------------------------------------------------------------

  var enabled = true;
  var disabledReason = "";

  function disable(reason) {
    enabled = false;
    disabledReason = reason;
    warn("Disabled —", reason);
  }

  function isLocalhost(h) {
    if (!h) return false;
    var host = h.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" ||
           host.slice(-6) === ".local" || host.slice(-10) === ".localhost";
  }

  if (!TRACKER_ID || !DOMAIN)                                disable("Missing data-tracker-id or data-domain.");
  if (!ALLOW_LOCAL && isLocalhost(window.location.hostname)) disable("On localhost. Add data-allow-localhost='true' to enable.");
  if (window !== window.parent)                              disable("Inside iframe.");

  // ---------------------------------------------------------------------------
  // Bot detection
  // ---------------------------------------------------------------------------

  function isBot() {
    try {
      if (window.navigator.webdriver || window.callPhantom || window._phantom || window.__nightmare) return true;
      if (!window.navigator || !window.location || !window.document) return true;
      var ua = (window.navigator.userAgent || "").toLowerCase();
      if (!ua || ua.length < 5 || ua === "undefined") return true;
      var botUA = ["headlesschrome","phantomjs","selenium","webdriver","puppeteer",
                   "playwright","python","curl","wget","java/","go-http","node.js","axios","postman"];
      for (var i = 0; i < botUA.length; i++) if (ua.indexOf(botUA[i]) !== -1) return true;
      var botProps = ["__webdriver_evaluate","__selenium_evaluate","__webdriver_script_function",
                      "__webdriver_unwrapped","__fxdriver_evaluate","__driver_evaluate",
                      "_Selenium_IDE_Recorder","_selenium","calledSelenium","$cdc_asdjflasutopfhvcZLmcfl_"];
      for (var j = 0; j < botProps.length; j++) if (typeof window[botProps[j]] !== "undefined") return true;
      var el = document.documentElement;
      if (el && (el.getAttribute("webdriver") || el.getAttribute("selenium") || el.getAttribute("driver"))) return true;
    } catch (e) { return false; }
    return false;
  }

  if (isBot()) disable("Bot detected.");

  // ---------------------------------------------------------------------------
  // localStorage helpers
  // ---------------------------------------------------------------------------

  function lsGet(key)        { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function lsSet(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function lsRemove(key)     { try { localStorage.removeItem(key); }     catch (e) {} }

  if (lsGet("tracker_ignore") === "true") disable("Opt-out flag in localStorage.");

  // ---------------------------------------------------------------------------
  // UUID
  // ---------------------------------------------------------------------------

  function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ---------------------------------------------------------------------------
  // User ID
  //
  // Two-phase identity model:
  //
  //   Phase 1 — Anonymous:
  //     A random UUID (_tracker_uid) is created on first visit and reused on
  //     every subsequent page load until the user logs in.
  //
  //   Phase 2 — Identified:
  //     When tracker.identify() is called, the stable ID (userId / email) is
  //     written to _tracker_identified_id and used from that point forward.
  //     The original anonymous UUID is sent once as `anonymous_id` so the
  //     backend can merge the pre-login events onto the identified user.
  //
  //   Account switch:
  //     If identify() is called with a different ID than what is stored,
  //     the old identity is cleared and the new one takes over cleanly.
  // ---------------------------------------------------------------------------

  function getUserId() {
    var identified = lsGet("_tracker_identified_id");
    if (identified) {
      log("Identified user ID:", identified);
      return identified;
    }
    var anon = lsGet("_tracker_uid");
    if (!anon) {
      anon = uuid();
      lsSet("_tracker_uid", anon);
      log("New anonymous user ID:", anon);
    } else {
      log("Existing anonymous user ID:", anon);
    }
    return anon;
  }

  // ---------------------------------------------------------------------------
  // Session ID — sessionStorage, resets when the tab closes
  // ---------------------------------------------------------------------------

  function getSessionId() {
    var id;
    try { id = sessionStorage.getItem("_tracker_sid"); } catch (e) {}
    if (!id) {
      id = uuid();
      try { sessionStorage.setItem("_tracker_sid", id); } catch (e) {}
      log("New session:", id);
    } else {
      log("Session resumed:", id);
    }
    return id;
  }

  var USER_ID    = getUserId();
  var SESSION_ID = getSessionId();
  var START_TIME = new Date().toISOString();
  var totalPinged = 0;

  // ---------------------------------------------------------------------------
  // Device / UA
  // ---------------------------------------------------------------------------

  function parseUserAgent() {
    var ua = navigator.userAgent || "";
    var device = "Desktop";
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      device = "Tablet";
    } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|bb\d+|meego|palm|symbian|opera mini|iemobile|wpdesktop/i.test(ua)) {
      device = "Mobile";
    }
    var browser = "Unknown";
    if      (/edg\//i.test(ua))         browser = "Edge";
    else if (/opr\//i.test(ua))         browser = "Opera";
    else if (/chrome|crios/i.test(ua))  browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua))        browser = "Safari";
    else if (/trident|msie/i.test(ua))  browser = "IE";
    else if (/samsung/i.test(ua))       browser = "Samsung Browser";
    var os = "Unknown";
    if      (/windows nt/i.test(ua))         os = "Windows";
    else if (/iphone os|ipad os/i.test(ua))  os = "iOS";
    else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua))            os = "Android";
    else if (/linux/i.test(ua))              os = "Linux";
    else if (/cros/i.test(ua))               os = "ChromeOS";
    return { device: device, browser: browser, os: os };
  }

  var deviceInfo = parseUserAgent();
  log("Device info:", deviceInfo);

  // ---------------------------------------------------------------------------
  // Referrer
  // ---------------------------------------------------------------------------

  function parseReferrer() {
    var ref = document.referrer;
    if (!ref) return null;
    try {
      var url = new URL(ref);
      return url.hostname === window.location.hostname ? null : url.hostname;
    } catch (e) { return null; }
  }

  var REFERRER = parseReferrer();
  log("Referrer:", REFERRER || "(direct)");

  // ---------------------------------------------------------------------------
  // Geo — cached in localStorage for 30 minutes
  // ---------------------------------------------------------------------------

  var geoData = null;

  function fetchGeo(callback) {
    var raw = lsGet("_tracker_geo");
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed._expires > Date.now()) {
          geoData = parsed;
          log("Geo from cache:", geoData);
          callback();
          return;
        }
      } catch (e) {}
      lsRemove("_tracker_geo");
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipapi.co/json/", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          geoData = {
            city:         data.city         || null,
            region:       data.region       || null,
            country:      data.country_name || null,
            country_code: data.country_code || null,
            latitude:     data.latitude     || null,
            longitude:    data.longitude    || null,
            timezone:     data.timezone     || null,
            ip:           data.ip           || null,
            _expires:     Date.now() + 30 * 60 * 1000,
          };
          lsSet("_tracker_geo", JSON.stringify(geoData));
          log("Geo fetched:", geoData);
        } catch (e) { warn("Geo parse error:", e); }
      } else {
        warn("Geo fetch failed — HTTP", xhr.status);
      }
      callback();
    };
    xhr.send();
  }

  // ---------------------------------------------------------------------------
  // Payload & sending
  // ---------------------------------------------------------------------------

  function buildPayload(time_spent, extras) {
    var base = {
      id:           TRACKER_ID,
      domain:       DOMAIN,
      session_id:   SESSION_ID,
      user_id:      USER_ID,
      time_spent:   time_spent,
      location:     window.location.pathname,
      start_time:   START_TIME,
      city:         geoData ? geoData.city         : null,
      region:       geoData ? geoData.region       : null,
      country:      geoData ? geoData.country      : null,
      country_code: geoData ? geoData.country_code : null,
      latitude:     geoData ? geoData.latitude     : null,
      longitude:    geoData ? geoData.longitude    : null,
      timezone:     geoData ? geoData.timezone     : null,
      ip:           geoData ? geoData.ip           : null,
      device:       deviceInfo.device,
      browser:      deviceInfo.browser,
      os:           deviceInfo.os,
      referrer:     REFERRER,
    };
    if (extras) {
      for (var k in extras) {
        if (Object.prototype.hasOwnProperty.call(extras, k)) base[k] = extras[k];
      }
    }
    return JSON.stringify(base);
  }

  function send(time_spent, extras) {
    if (!enabled) { log("Blocked —", disabledReason); return; }
    if (isBot())  { log("Blocked — bot."); return; }
    totalPinged += time_spent;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) log("OK — time_spent:", time_spent);
        else                    warn("Failed — HTTP", xhr.status);
      }
    };
    xhr.send(buildPayload(time_spent, extras));
  }

  function beacon(time_spent) {
    if (!enabled || time_spent <= 0) return;
    var payload = buildPayload(time_spent);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API_URL, new Blob([payload], { type: "application/json" }));
      log("Beacon — time_spent:", time_spent);
    } else {
      send(time_spent);
    }
  }

  // ---------------------------------------------------------------------------
  // Heartbeat & visibility
  // ---------------------------------------------------------------------------

  setInterval(function () { send(30); }, 30000);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      var remainder = Math.floor((Date.now() - new Date(START_TIME).getTime()) / 1000) - totalPinged;
      beacon(remainder);
    }
  });

  // ---------------------------------------------------------------------------
  // SPA route change detection
  // ---------------------------------------------------------------------------

  var lastPath     = window.location.pathname;
  var lastPingTime = 0;
  var debounce     = null;

  function onRouteChange() {
    var current = window.location.pathname;
    var now = Date.now();
    if (current === lastPath && now - lastPingTime < 60000) return;
    lastPath     = current;
    lastPingTime = now;
    START_TIME   = new Date().toISOString();
    totalPinged  = 0;
    clearTimeout(debounce);
    debounce = setTimeout(function () { send(0); log("Route →", current); }, 100);
  }

  var _pushState = window.history.pushState;
  window.history.pushState = function () { _pushState.apply(this, arguments); onRouteChange(); };
  window.addEventListener("popstate", onRouteChange);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.tracker = {

    identify: function (opts) {
      opts = opts || {};
      if (!opts.userId && !opts.name && !opts.email) {
        warn("identify() needs at least userId, name, or email.");
        return;
      }

      var stableId = opts.userId || opts.email || USER_ID;
      var existing = lsGet("_tracker_identified_id");
      var anonId   = lsGet("_tracker_uid"); // pre-login UUID, null if already identified

      if (!existing) {
        // First-time identification on this device — stitch anon → stable
        lsSet("_tracker_identified_id", stableId);
        USER_ID = stableId;
        window.tracker.userId = USER_ID;
        log("Identity stitched:", anonId, "→", stableId);

      } else if (existing !== stableId) {
        // Different user logged in (account switch) — clean slate
        lsRemove("_tracker_uid");
        lsSet("_tracker_identified_id", stableId);
        USER_ID = stableId;
        window.tracker.userId = USER_ID;
        anonId = null; // no anon ID to stitch; previous session was already identified
        log("Identity switched →", stableId);

      } else {
        // Same user re-identifying (e.g. page refresh while logged in) — no-op on storage
        log("Identity confirmed:", stableId);
      }

      send(0, {
        user_id:      stableId,
        anonymous_id: anonId || null, // backend uses this to merge pre-login events
        name:         opts.name  || null,
        email:        opts.email || null,
      });
      log("Identify —", opts);
    },

    sessionId: SESSION_ID,
    userId:    USER_ID,
    geo:       function () { return geoData; },
    device:    deviceInfo,
    referrer:  REFERRER,
  };

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  fetchGeo(function () {
    send(0);
    log("Initialised | tracker:", TRACKER_ID, "| domain:", DOMAIN);
  });
})(document.currentScript);