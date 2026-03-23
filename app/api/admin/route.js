import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
  const supabase = createClient(await cookies());

  const trackerId =
    req.nextUrl.searchParams.get("trackerId") ||
    req.headers.get("x-tracker-id");

  if (!trackerId) {
    return new Response(JSON.stringify({ error: "Missing tracker ID" }), {
      status: 400,
    });
  }

  const email =
    req.headers.get("x-user-email") ?? req.nextUrl.searchParams.get("email");

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), {
      status: 400,
    });
  }

  const { data: existingAdmin, error: fetchError } = await supabase
    .from("admins")
    .select("*")
    .eq("tracker_id", trackerId)
    .eq("user_id", email)
    .maybeSingle();
  console.log(
    "Existing admin record:",
    existingAdmin,
    "Fetch error:",
    fetchError,
  );
  if (fetchError) {
    console.error(fetchError);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
    });
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
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, action: "removed" }), {
      status: 200,
    });
  } else {
    const { error: insertError } = await supabase.from("admins").insert({
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
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, action: "added" }), {
      status: 200,
    });
  }
}

export async function GET(req) {
  const supabase = createClient(await cookies());
  const email = await supabase.auth
    .getUser()
    .then(({ data }) => data?.user?.email);

  if (!email) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    });
  }

  const trackerId =
    req.nextUrl.searchParams.get("trackerId") ||
    req.headers.get("x-tracker-id");
  if (!trackerId) {
    return new Response(JSON.stringify({ error: "Missing tracker ID" }), {
      status: 400,
    });
  }
  const { data: creatorData, error: creatorError } = await supabase
    .from("trackers")
    .select("creator")
    .eq("id", trackerId)
    .single();
  const { data: isAdmin } = await supabase
    .from("admins")
    .select("*")
    .eq("tracker_id", trackerId)
    .eq("user_id", email)
    .single();

  if (!isAdmin && creatorData?.creator !== email) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (creatorError) {
    console.error("creatorError:", creatorError);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
    });
  }
  const creatorEmail = creatorData?.creator;

  const {data: creatorInfo, error: creatorInfoError} = await supabase
    .from("users")
    .select("name, email")
    .eq("email", creatorEmail)
    .eq("tracker_id", trackerId)
    .single();
  if (creatorInfoError) {
    console.error("creatorInfoError:", creatorInfoError);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
    });
  }
  const creatorName = creatorInfo?.name;

  let admins_data = [];
  const { data: admins, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("tracker_id", trackerId);
  for (const admin of admins) {
    console.log("xyz:", admin);
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("name, email")
      .eq("email", admin.user_id)
      .eq("tracker_id", trackerId)
      .single();
    admins_data.push(user);
    if (userError) {
      console.error("userError:", userError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
      });
    }
  }
    if (error) {
      console.error("error:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
      });
    }
    console.log("Admins data:", admins_data);
    return new Response(JSON.stringify({ admins: admins_data, creatorEmail, creatorName }), {
      status: 200,
    });
  
}
