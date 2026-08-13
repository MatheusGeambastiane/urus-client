import { AuthScreen } from "@/features/auth/components/auth-screen";

type AuthPageProps = {
  searchParams?: Promise<{ tab?: string; redirect?: string; error?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = await searchParams;
  const tab =
    resolvedSearchParams?.tab === "register" ? "register" : "login";
  const redirect = resolvedSearchParams?.redirect ?? "/";
  const initialMessage = resolvedSearchParams?.error
    ? "Não foi possível entrar com o Google. Tente novamente ou use seu e-mail e senha."
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      <AuthScreen
        defaultTab={tab}
        redirectTo={redirect}
        initialMessage={initialMessage}
      />
    </main>
  );
}
