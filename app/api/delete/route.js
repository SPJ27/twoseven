import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
  const supabase = createClient(await cookies());
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  // Fetch the tracker to check ownership
  const { data: tracker, error: fetchError } = await supabase
    .from("trackers")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !tracker) {
    return new Response(JSON.stringify({ error: "Tracker not found" }), { status: 404 });
  }

  if (tracker.creator !== user.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  // Only reaches here if user is the creator
  const { error: deleteError } = await supabase
    .from("trackers")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Tracker deleted successfully" }), { status: 200 });
}