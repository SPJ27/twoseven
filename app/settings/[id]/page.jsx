import Navbar from "@/components/Navbar";
import Settings from "@/components/settingsPage/Settings";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";

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
    `http://192.168.56.1:3000/api/projects?email=${user?.email}`,
    {
      headers: {
        "x-user-email": user?.email ?? "",
      },
    },
  );
  const json = await res.json();
  let projects = json.data;
  let domain = null;
  for (let project of projects) {
    if (project.id === id) {
      domain = project.domain;
      break;
    }
  }
  if (!domain) {
    return <div className="p-10">Project not found.</div>;
  }
  return (
    <div className="bg-[#fbfaf9] min-h-screen">
      <Navbar user={user?.user_metadata} />
      <Settings user={user?.user_metadata} domain={domain} id={id} />
    </div>
  );
};

export default page;
