
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import DarkmodeProvider from '@/components/DarkmodeProviders/DarkmodeProvider';

const page = async ({ params }) => {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  const user = data?.user.user_metadata;

  return (
    <DarkmodeProvider user={user} trackerId={id} userEmail={user?.email} />
  );
};

export default page;