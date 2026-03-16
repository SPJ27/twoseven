import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    const supabase = createClient(await cookies())
    const {data} = await supabase.auth.getUser();
    const user = data?.user;
    const body = await req.json();
    const {id, domain} = body;
    const {data: updatedProject, error} = await supabase.from("trackers").update({domain}).eq("id", id).eq("creator", user?.email);
    console.log("Updated project:", updatedProject, "Error:", error);
    if (error) {
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

    return new Response(JSON.stringify({project: updatedProject}), {status: 200});
}