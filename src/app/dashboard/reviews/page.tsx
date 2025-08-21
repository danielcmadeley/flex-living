import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ReviewsPageClient } from "./ReviewsPageClient";

const ReviewsPageWrapper = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ReviewsPageClient user={user} />;
};

export default ReviewsPageWrapper;
