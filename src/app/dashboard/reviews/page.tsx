import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardContent from "../components/DashboardContent";

const ReviewsPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardContent user={user} />;
};

export default ReviewsPage;
