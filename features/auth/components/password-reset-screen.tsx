"use client";

import { useEffect, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { requestPasswordReset } from "@/features/auth/services/auth-service";

export const PasswordResetScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    setRedirecting(true);
    const timer = window.setTimeout(() => {
      window.location.href = "/";
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Informe um email valido.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.detail);
    } catch (requestError) {
      setError("Nao foi possivel enviar a solicitacao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Redefinicao
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Esqueci minha senha
        </h1>
        <p className="text-sm text-ink-600">
          Informe seu email para receber as instrucoes.
        </p>
      </header>

      {error ? (
        <div className="rounded-3xl bg-white px-4 py-3 text-sm text-red-600 shadow-soft">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <label className="text-sm font-semibold text-ink-700">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ana@example.com"
        />
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        className="h-12 w-full"
        disabled={loading || Boolean(message)}
      >
        {loading ? "Enviando..." : message ? "Enviado" : "Redefinir"}
      </Button>

      {message ? (
        <div className="rounded-3xl bg-white px-4 py-3 text-sm text-ink-600 shadow-soft">
          <p>{message}</p>
          {redirecting ? (
            <p className="mt-2 text-xs text-ink-500">
              Redirecionando para a home...
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
