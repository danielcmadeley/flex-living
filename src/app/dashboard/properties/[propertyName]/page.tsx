import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { PropertyDetailsContent } from "./PropertyDetailsContent";

interface PropertyPageProps {
  params: Promise<{
    propertyName: string;
  }>;
}

const PropertyPage = async ({ params }: PropertyPageProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const decodedPropertyName = decodeURIComponent(resolvedParams.propertyName);

  return (
    <PropertyDetailsContent user={user} propertyName={decodedPropertyName} />
  );
};

export default PropertyPage;
