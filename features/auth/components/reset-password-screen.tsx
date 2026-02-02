"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { getPasswordStrength } from "@/features/auth/utils/password-strength";
import { confirmPasswordReset } from "@/features/auth/services/auth-service";

export const ResetPasswordScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => {
      router.push("/auth?tab=login");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage, router]);

  const handleSubmit = async () => {
    if (!uid || !token) {
      setError("Link invalido ou expirado.");
      return;
    }
    if (!password) {
      setError("Informe a nova senha.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await confirmPasswordReset({ uid, token, password });
      setToastMessage(response.detail);
    } catch (requestError) {
      setError("Nao foi possivel redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage ? (
        <div className="fixed top-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          {toastMessage}
        </div>
      ) : null}

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Redefinicao
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Nova senha
        </h1>
        <p className="text-sm text-ink-600">
          Escolha uma nova senha para sua conta.
        </p>
      </header>

      {error ? (
        <div className="rounded-3xl bg-white px-4 py-3 text-sm text-red-600 shadow-soft">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <label className="text-sm font-semibold text-ink-700">
          Nova senha
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua nova senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {showPassword ? (
                <>
                  <path
                    d="M3 12C4.8 8 8 6 12 6C16 6 19.2 8 21 12C19.2 16 16 18 12 18C8 18 4.8 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M3 12C4.8 8 8 6 12 6C16 6 19.2 8 21 12C19.2 16 16 18 12 18C8 18 4.8 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4 4L20 20"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-ink-100">
            <div
              className="h-2 rounded-full bg-ink-900 transition-all"
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
          <p className="text-xs text-ink-500">
            Forca da senha: {strength.label}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-ink-700">
          Confirmar senha
        </label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repita sua nova senha"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500"
            aria-label={
              showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {showConfirmPassword ? (
                <>
                  <path
                    d="M3 12C4.8 8 8 6 12 6C16 6 19.2 8 21 12C19.2 16 16 18 12 18C8 18 4.8 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M3 12C4.8 8 8 6 12 6C16 6 19.2 8 21 12C19.2 16 16 18 12 18C8 18 4.8 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4 4L20 20"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        className="h-12 w-full"
        disabled={loading || Boolean(toastMessage)}
      >
        {loading ? "Salvando..." : "Atualizar senha"}
      </Button>
    </div>
  );
};
