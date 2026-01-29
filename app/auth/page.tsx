import { AuthScreen } from "@/features/auth/components/auth-screen";

type AuthPageProps = {
  searchParams?: Promise<{ tab?: string; redirect?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = await searchParams;
  const tab =
    resolvedSearchParams?.tab === "register" ? "register" : "login";
  const redirect = resolvedSearchParams?.redirect ?? "/";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      <AuthScreen defaultTab={tab} redirectTo={redirect} />
    </main>
  );
}
