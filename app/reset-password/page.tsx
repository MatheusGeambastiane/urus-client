import { Suspense } from "react";
import { ResetPasswordScreen } from "@/features/auth/components/reset-password-screen";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      <Suspense
        fallback={
          <div className="rounded-3xl bg-white px-4 py-5 text-sm text-ink-500 shadow-soft">
            Carregando...
          </div>
        }
      >
        <ResetPasswordScreen />
      </Suspense>
    </main>
  );
}
