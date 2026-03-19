import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
  const supabase = createClient(await cookies());

  const trackerId =
    req.nextUrl.searchParams.get("trackerId") ||
    req.headers.get("x-tracker-id");

  if (!trackerId) {
    return new Response(JSON.stringify({ error: "Missing tracker ID" }), { status: 400 });
  }

  const email =
    req.headers.get("x-user-email") ??
    req.nextUrl.searchParams.get("email");

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), { status: 400 });
  }

  const { data: existingAdmin, error: fetchError } = await supabase
    .from("admins")
    .select("*")
    .eq("tracker_id", trackerId)
    .eq("user_id", email)
    .maybeSingle();
  console.log("Existing admin record:", existingAdmin, "Fetch error:", fetchError);
  if (fetchError) {
    console.error(fetchError);
    return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
  }

  if (existingAdmin) {
    const { error: deleteError } = await supabase
      .from("admins")
      .delete()
      .eq("tracker_id", trackerId)
      .eq("user_id", email);

    const { error: updateError } = await supabase
      .from("users")
      .update({ admin: false })
      .eq("tracker_id", trackerId)
      .eq("email", email);

    if (deleteError || updateError) {
      console.error(deleteError || updateError);
      return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ success: true, action: "removed" }),
      { status: 200 }
    );
  } else {
    const { error: insertError } = await supabase
      .from("admins")
      .insert({
        tracker_id: trackerId,
        user_id: email,
      });

    const { error: updateError } = await supabase
      .from("users")
      .update({ admin: true })
      .eq("tracker_id", trackerId)
      .eq("email", email);
      
    if (insertError || updateError) {
      console.error(insertError || updateError);
      return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
    }
    
    return new Response(
      JSON.stringify({ success: true, action: "added" }),
      { status: 200 }
    );
  }
}