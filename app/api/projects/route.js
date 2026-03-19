import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

function computeTrend(graph) {
  if (!graph?.length) return 0;
  const half = Math.floor(graph.length / 2);
  const prior = graph.slice(0, half).reduce((s, n) => s + n, 0);
  const recent = graph.slice(-half).reduce((s, n) => s + n, 0);
  if (prior === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - prior) / prior) * 100);
}

function buildSparkline(visits) {
  const POINTS = 14;
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const counts = Array(POINTS).fill(0);

  for (const visit of visits) {
    const daysAgo = Math.floor((now - new Date(visit.start_time)) / msPerDay);
    const idx = POINTS - 1 - daysAgo;
    if (idx >= 0 && idx < POINTS) counts[idx]++;
  }

  return counts;
}

async function fetchTrackerStats(supabase, trackerId) {
  const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: visits, error } = await supabase
    .from("visits")
    .select("start_time, session_id")
    .eq("tracker_id", trackerId)
    .gte("start_time", from);

  if (error) throw error;

  return {
    totalVisits: visits.length,
    totalSessions: new Set(visits.map((v) => v.session_id)).size,
    sparklineGraph: buildSparkline(visits),
  };
}

export async function GET(req) {
  const supabase = createClient(await cookies());

  const email =
    req.headers.get("x-user-email") ?? req.nextUrl.searchParams.get("email");

  if (!email) {
    return Response.json(
      { success: false, error: "Missing email" },
      { status: 400 },
    );
  }

  const { data: trackers, error: trackersError } = await supabase
    .from("trackers")
    .select("id, domain, connected, created_at")
    .eq("creator", email)
    .order("created_at", { ascending: false });
  console.log("Fetched trackers:", trackers, "Error:", trackersError);
  const { data: adminTrackers, error: trackerError } = await supabase
    .from("admins")
    .select("id, user_id, tracker_id")
    .eq("user_id", email);

  for (const admin of adminTrackers) {
    const { data: tracker, error } = await supabase
      .from("trackers")
      .select("id, domain, connected, created_at")
      .eq("id", admin.tracker_id)
      .single();
    if (error) {
      console.error("[stats] tracker error:", error);
      return Response.json({ success: false, error: "Database error" }, { status: 500 });
    }
    trackers.push(tracker);
  }

    if (trackersError) {
    return Response.json(
      { success: false, error: "Database error" },
      { status: 500 },
    );
  }

  const results = await Promise.allSettled(
    trackers.map((t) => fetchTrackerStats(supabase, t.id)),
  );

  const projects = trackers.map((tracker, i) => {
    const result = results[i];

    if (!tracker.connected || result.status === "rejected") {
      return {
        id: tracker.id,
        name: tracker.name ?? "Untitled",
        domain: tracker.domain ?? "",
        connected: tracker.connected ?? false,
        visits: 0,
        sessions: 0,
        created: tracker.created_at?.slice(0, 10) ?? null,
        trend: 0,
        graph: Array(14).fill(0),
      };
    }

    const { totalVisits, totalSessions, sparklineGraph } = result.value;

    return {
      id: tracker.id,
      name: tracker.name ?? "Untitled",
      domain: tracker.domain ?? "",
      connected: tracker.connected ?? false,
      visits: totalVisits,
      sessions: totalSessions,
      created: tracker.created_at?.slice(0, 10) ?? null,
      trend: computeTrend(sparklineGraph),
      graph: sparklineGraph,
    };
  });

  return Response.json({ success: true, data: projects });
}

export async function POST(req) {
  const supabase = createClient(await cookies());

  const email =
    req.headers.get("x-user-email") ?? req.nextUrl.searchParams.get("email");

  if (!email) {
    return Response.json(
      { success: false, error: "Missing email" },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.domain) {
    return Response.json(
      { success: false, error: "Missing domain" },
      { status: 400 },
    );
  }

  const domain = body.domain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  const { data: tracker, error } = await supabase
    .from("trackers")
    .insert({ domain, creator: email, connected: false })
    .select("id, domain, connected, created_at")
    .single();

  if (error) {
    return Response.json(
      { success: false, error: "Database error" },
      { status: 500 },
    );
  }
  console.log("Created tracker:", tracker);
  return Response.json(
    {
      success: true,
      data: {
        id: tracker.id,
        name: tracker.name,
        domain: tracker.domain,
        connected: tracker.connected,
        created: tracker.created_at?.slice(0, 10) ?? null,
        visits: 0,
        sessions: 0,
        trend: 0,
        graph: Array(14).fill(0),
      },
    },
    { status: 201 },
  );
}
