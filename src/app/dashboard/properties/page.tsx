import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { PropertiesPage } from "../pages/PropertiesPage";
import { DashboardSidebar } from "../components/DashboardSidebar";
import type { User } from "@supabase/supabase-js";

interface PropertiesPageWrapperProps {
  user: User;
}

function PropertiesPageWrapper({ user }: PropertiesPageWrapperProps) {
  return (
    <DashboardSidebar user={user} reviews={[]}>
      <PropertiesPage />
    </DashboardSidebar>
  );
}

const PropertiesPageRoute = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PropertiesPageWrapper user={user} />;
};

export default PropertiesPageRoute;
