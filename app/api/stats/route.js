import { createClient } from "@/utils/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Anonymous client used only for API key validation (no user session needed)
const anonSupabase = createAnonClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
);

async function resolveIdentity(req) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    const { data: apiKey, error } = await anonSupabase
      .from("api_keys")
      .select("tracker_id, created_by")
      .eq("key", token)
      .single();

    if (error || !apiKey) return { error: "Invalid API key", status: 401 };

    // Update last_used_at — fire and forget
    anonSupabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("key", token)
      .then(() => {});

    return {
      email: apiKey.created_by,
      apiKeyTrackerId: apiKey.tracker_id,
      supabase: anonSupabase,
    };
  }

  // Session cookie auth
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return { error: "Unauthorized", status: 401 };

  return { email: data.user.email, supabase };
}

export async function GET(req) {
  const identity = await resolveIdentity(req);
  if (identity.error) {
    return Response.json(
      { success: false, error: identity.error },
      { status: identity.status },
    );
  }

  const { email, apiKeyTrackerId, supabase } = identity;

  const id = req.nextUrl.searchParams.get("id");
  const fromDate = req.nextUrl.searchParams.get("fromDate");
  const toDate = req.nextUrl.searchParams.get("toDate");

  if (!id) {
    return Response.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  if (apiKeyTrackerId && apiKeyTrackerId !== id) {
    return Response.json(
      { success: false, error: "API key not authorized for this tracker" },
      { status: 403 },
    );
  }

  const { data: tracker, error: trackerError } = await supabase
    .from("trackers")
    .select("*")
    .eq("id", id)
    .single();

  if (trackerError || !tracker) {
    return Response.json({ success: false, error: "Tracker not found" }, { status: 404 });
  }

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("*")
    .eq("tracker_id", id)
    .eq("user_id", email)
    .single();

  if (!isAdmin && tracker.creator !== email) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let visitsQuery = supabase
    .from("visits")
    .select("*")
    .eq("tracker_id", id)
    .order("date", { ascending: false });

  let usersQuery = supabase
    .from("users")
    .select(`
      id,
      user_id,
      name,
      email,
      date_created,
      admin,
      user_visits (
        visit_id,
        visits (
          start_time,
          country,
          city,
          device,
          browser,
          os
        )
      )
    `)
    .eq("tracker_id", id)
    .order("date_created", { ascending: false });

  if (fromDate) {
    const from = new Date(fromDate).toISOString();
    visitsQuery = visitsQuery.gte("date", from);
    usersQuery = usersQuery.gte("date_created", from);
  }
  if (toDate) {
    const to = new Date(toDate + "T23:59:59.999Z").toISOString();
    visitsQuery = visitsQuery.lte("date", to);
    usersQuery = usersQuery.lte("date_created", to);
  }

  const [
    { data: visits, error: visitsError },
    { data: users, error: usersError },
  ] = await Promise.all([visitsQuery, usersQuery]);

  if (visitsError || usersError) {
    console.error("[stats] visits error:", visitsError);
    console.error("[stats] users error:", usersError);
    return Response.json({ success: false, error: "Database error" }, { status: 500 });
  }

  // ── Range detection ──────────────────────────────────────────────────────────
  let rangeStart, rangeEnd;

  if (fromDate && toDate) {
    rangeStart = new Date(fromDate);
    rangeEnd = new Date(toDate + "T23:59:59.999Z");
  } else if (visits.length > 0) {
    const times = visits.map((v) => new Date(v.start_time).getTime());
    rangeStart = new Date(Math.min(...times));
    rangeEnd = new Date(Math.max(...times));
  } else {
    rangeStart = new Date();
    rangeEnd = new Date();
  }

  // ── Previous period ──────────────────────────────────────────────────────────
  const periodMs = rangeEnd - rangeStart;
  const prevRangeEnd = new Date(rangeStart.getTime() - 1);
  const prevRangeStart = new Date(prevRangeEnd.getTime() - periodMs);

  const [{ data: prevVisits }, { data: prevUsers }] = await Promise.all([
    supabase
      .from("visits")
      .select("session_id, time_spent")
      .eq("tracker_id", id)
      .gte("date", prevRangeStart.toISOString())
      .lte("date", prevRangeEnd.toISOString()),
    supabase
      .from("users")
      .select("id")
      .eq("tracker_id", id)
      .gte("date_created", prevRangeStart.toISOString())
      .lte("date_created", prevRangeEnd.toISOString()),
  ]);

  // ── Percent-change helper ────────────────────────────────────────────────────
  function pctChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }

  // ── Bucket helpers ───────────────────────────────────────────────────────────
  const diffDays = (rangeEnd - rangeStart) / (1000 * 60 * 60 * 24);
  const bucketMode = diffDays < 1 ? "hour" : diffDays <= 90 ? "day" : "month";

  function getBucketKey(isoString) {
    const d = new Date(isoString);
    if (bucketMode === "hour")
      return d.toLocaleString("en-US", { hour: "numeric", hour12: true, timeZone: "UTC" });
    if (bucketMode === "day")
      return d.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return d.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }

  function generateBuckets() {
    const buckets = {};
    const cursor = new Date(rangeStart);

    if (bucketMode === "hour") {
      cursor.setUTCMinutes(0, 0, 0);
      const end = new Date(rangeEnd);
      end.setUTCMinutes(59, 59, 999);
      while (cursor <= end) {
        buckets[getBucketKey(cursor.toISOString())] = 0;
        cursor.setUTCHours(cursor.getUTCHours() + 1);
      }
    } else if (bucketMode === "day") {
      cursor.setUTCHours(0, 0, 0, 0);
      const end = new Date(rangeEnd);
      end.setUTCHours(23, 59, 59, 999);
      while (cursor <= end) {
        buckets[getBucketKey(cursor.toISOString())] = 0;
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    } else {
      cursor.setUTCDate(1);
      cursor.setUTCHours(0, 0, 0, 0);
      while (cursor <= rangeEnd) {
        buckets[getBucketKey(cursor.toISOString())] = 0;
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }

    return buckets;
  }

  // ── Aggregate current period ─────────────────────────────────────────────────
  const visitsBuckets = generateBuckets();
  const usersBuckets = generateBuckets();

  let totalTimeSpent = 0;
  const visitedPages = {};
  const countries = {};
  const cities = {};
  const devices = {};
  const browsers = {};
  const oses = {};
  const referrers = {};
  const sessionMap = {};
  const country_codes = {};

  function increment(obj, key) {
    if (key) obj[key] = (obj[key] || 0) + 1;
  }

  for (const visit of visits) {
    totalTimeSpent += visit.time_spent;

    increment(visitedPages, visit.location);
    increment(countries, visit.country);
    increment(cities, visit.city);
    increment(devices, visit.device);
    increment(browsers, visit.browser);
    increment(oses, visit.os);
    increment(referrers, visit.referrer || "Direct");
    if (visit.country && visit.country_code) {
      country_codes[visit.country] = visit.country_code.toLowerCase();
    }

    const key = getBucketKey(visit.start_time);
    visitsBuckets[key] = (visitsBuckets[key] ?? 0) + 1;

    if (!sessionMap[visit.session_id]) {
      sessionMap[visit.session_id] = { pages: 0, time: 0 };
    }
    sessionMap[visit.session_id].pages += 1;
    sessionMap[visit.session_id].time += visit.time_spent;
  }

  for (const user of users) {
    const key = getBucketKey(user.date_created);
    usersBuckets[key] = (usersBuckets[key] ?? 0) + 1;
  }

  const graph = Object.keys(visitsBuckets).map((label) => ({
    label,
    visits: visitsBuckets[label] || 0,
    users: usersBuckets[label] || 0,
  }));

  // ── Sessions / bounce ────────────────────────────────────────────────────────
  const totalSessions = Object.keys(sessionMap).length;
  const bounceSessions = Object.values(sessionMap).filter(
    (s) => s.pages === 1 && s.time < 30,
  ).length;
  const bounceRate =
    totalSessions > 0
      ? ((bounceSessions / totalSessions) * 100).toFixed(1) + "%"
      : "0.0%";

  const prevTotalVisits = prevVisits?.length ?? 0;
  const prevUniqueVisitors = prevUsers?.length ?? 0;

  const prevSessionMap = {};
  let prevTotalTimeSpent = 0;
  for (const v of prevVisits ?? []) {
    prevTotalTimeSpent += v.time_spent ?? 0;
    if (!prevSessionMap[v.session_id])
      prevSessionMap[v.session_id] = { pages: 0, time: 0 };
    prevSessionMap[v.session_id].pages += 1;
    prevSessionMap[v.session_id].time += v.time_spent ?? 0;
  }
  const prevTotalSessions = Object.keys(prevSessionMap).length;
  const prevBounceSessions = Object.values(prevSessionMap).filter(
    (s) => s.pages === 1 && s.time < 30,
  ).length;
  const prevBounceRateNum =
    prevTotalSessions > 0 ? (prevBounceSessions / prevTotalSessions) * 100 : 0;
  const currBounceRateNum =
    totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;
  const prevAvgTime =
    prevTotalVisits > 0 ? prevTotalTimeSpent / prevTotalVisits : 0;
  const currAvgTime = visits.length > 0 ? totalTimeSpent / visits.length : 0;
  const prevAvgVisits =
    prevUniqueVisitors > 0 ? prevTotalVisits / prevUniqueVisitors : 0;
  const currAvgVisits = users.length > 0 ? visits.length / users.length : 0;

  const enrichedUsers = users.map((u) => {
    const userVisits = (u.user_visits ?? [])
      .map((uv) => uv.visits)
      .filter(Boolean);

    const latestVisit = userVisits.reduce((latest, v) => {
      if (!latest) return v;
      return new Date(v.start_time) > new Date(latest.start_time) ? v : latest;
    }, null);

    return {
      id: u.id,
      userId: u.user_id,
      name: u.name ?? null,
      email: u.email ?? null,
      dateCreated: u.date_created,
      admin: u.admin ?? false,
      visits: userVisits.length,
      lastSeen: latestVisit?.start_time ?? u.date_created,
      country: latestVisit?.country ?? null,
      city: latestVisit?.city ?? null,
      device: latestVisit?.device ?? null,
      browser: latestVisit?.browser ?? null,
      os: latestVisit?.os ?? null,
      country_code: latestVisit?.country_code ?? null,
    };
  });

  return Response.json({
    success: true,
    data: {
      totalVisits: visits.length,
      totalVisitsChange: pctChange(visits.length, prevTotalVisits),

      uniqueVisitors: users.length,
      uniqueVisitorsChange: pctChange(users.length, prevUniqueVisitors),

      totalSessions,
      totalSessionsChange: pctChange(totalSessions, prevTotalSessions),

      bounceRate,
      bounceRateChange: pctChange(currBounceRateNum, prevBounceRateNum),

      avgVisitsPerUser: currAvgVisits.toFixed(2),
      avgVisitsPerUserChange: pctChange(currAvgVisits, prevAvgVisits),

      avgTimeSpent: currAvgTime.toFixed(2),
      avgTimeSpentChange: pctChange(currAvgTime, prevAvgTime),

      visitedPages,
      countries,
      cities,
      devices,
      browsers,
      oses,
      referrers,
      graph,
      bucketMode,
      creator: tracker?.creator ?? null,
      connected: tracker?.connected ?? false,
      domain: tracker?.domain ?? null,
      users: enrichedUsers,
      country_codes,
    },
  });
}