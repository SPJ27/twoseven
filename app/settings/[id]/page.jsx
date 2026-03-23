import SettingsDarkmodeProvider from "@/components/DarkmodeProviders/SettingsDarkmodeProvider";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const metadata = {
  title: "TwoSeven Settings",
  description: "Get High Quality Analytics for Your Website",
};

const page = async ({ params }) => {
  let { id } = await params;

  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/projects?email=${user?.email}`,
    { headers: { "x-user-email": user?.email ?? "" } },
  );
  const json = await res.json();
  const projects = json.data;

  let domain = null;
  for (let project of projects) {
    if (project.id === id) { domain = project.domain; break; }
  }

  if (!domain) return <div className="p-10">Project not found.</div>;

  return (
    <SettingsDarkmodeProvider user={user?.user_metadata} domain={domain} id={id} />
  );
};

export default page;