import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

function generateApiKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "ts_";
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(req) {
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    console.warn("Unauthorized attempt to generate API key");
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { tracker_id } = await req.json();
  if (!tracker_id) {
    return Response.json({ success: false, error: "tracker_id required" }, { status: 400 });
  }

  const { data: tracker } = await supabase
    .from("trackers")
    .select("creator")
    .eq("id", tracker_id)
    .single();

  if (tracker?.creator !== data.user.email) {
    console.warn("Unauthorized attempt to generate API key for tracker", tracker_id);
    return Response.json({ success: false, error: "Only the creator can generate API keys" }, { status: 403 });
  }

  const { data: apiKey, error } = await supabase
    .from("api_keys")
    .insert({
      key: generateApiKey(),
      tracker_id,
      created_by: data.user.email,
    })
    .select()
    .single();

  if (error) {
    console.error("Error generating API key:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, key: apiKey.key });
}

export async function GET(req) {
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const tracker_id = req.nextUrl.searchParams.get("tracker_id");
  if (!tracker_id) {
    return Response.json({ success: false, error: "tracker_id required" }, { status: 400 });
  }

  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("id, key, created_at, last_used_at")
    .eq("tracker_id", tracker_id)
    .eq("created_by", data.user.email);

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, data: keys });
}

export async function DELETE(req) {
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return Response.json({ success: false, error: "id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("created_by", data.user.email);

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}