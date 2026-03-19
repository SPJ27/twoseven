import Dashboard from "@/components/dashboard/Dashboard";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = createClient(await cookies());
  const {data} = await supabase.auth.getUser();
  const user = data?.user;
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/projects?email=${user?.email}`, {
    headers: {
      "x-user-email": user?.email ?? "",
    },
  });
  const json = await res.json();

  return <Dashboard projects={json.data} user={user.user_metadata}/>;
}
