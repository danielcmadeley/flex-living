import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardContent from "./components/DashboardContent";
import { UrlStateProvider } from "@/components/UrlStateProvider";

const Dashboard = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <UrlStateProvider enabled={true} debounceMs={300}>
      <DashboardContent user={user} />
    </UrlStateProvider>
  );
};

export default Dashboard;
