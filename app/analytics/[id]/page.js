import AnalyticsComponents from '@/components/analytics/main';
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Navbar from '@/components/Navbar';

const page = async ({params}) => {

    const {id} = await params;
    const supabase = createClient(await cookies());
      const {data} = await supabase.auth.getUser();
      const user = data?.user.user_metadata;
  return (
    <div>
      <Navbar user={user}/>
        <AnalyticsComponents TRACKER_ID={id} user_email={user?.email} />
    </div>
  )
}

export default page