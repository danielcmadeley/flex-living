import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardContent from "../components/DashboardContent";

const SettingsPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardContent user={user} />;
};

export default SettingsPage;
