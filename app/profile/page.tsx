import { redirect } from "next/navigation";
import { getAuthSession } from "@/shared/auth/server";
import { ProfilePage } from "@/features/profile/components/profile-page";

export default async function ProfileRoute() {
  const session = await getAuthSession();
  const accessToken = (session?.user as { accessToken?: string | null })
    ?.accessToken;
  const refreshToken = (session?.user as { refreshToken?: string | null })
    ?.refreshToken;

  if (!accessToken) {
    redirect("/auth?tab=login&redirect=/profile");
  }

  return (
    <ProfilePage accessToken={accessToken} refreshToken={refreshToken} />
  );
}
