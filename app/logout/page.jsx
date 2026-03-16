import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const page = async () => {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect("/login");
};

export default page;
