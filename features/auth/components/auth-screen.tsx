"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginSchema, registerSchema } from "../validation/auth-schemas";
import { getPasswordStrength } from "../utils/password-strength";
import { registerUser } from "../services/auth-service";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type AuthScreenProps = {
  defaultTab: "login" | "register";
  redirectTo: string;
};

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  password: string;
  confirmPassword: string;
  autoLogin: boolean;
};

export const AuthScreen = ({ defaultTab, redirectTo }: AuthScreenProps) => {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    password: "",
    confirmPassword: "",
    autoLogin: true,
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const strength = useMemo(
    () => getPasswordStrength(registerForm.password),
    [registerForm.password]
  );

  const handleLoginSubmit = async () => {
    setAuthMessage(null);
    const validation = loginSchema.safeParse(loginForm);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        errors[key] = issue.message;
      });
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: loginForm.email,
        password: loginForm.password,
      });

      if (result?.error) {
        setAuthMessage(result.error);
        return;
      }
      router.push(redirectTo);
    } catch (error) {
      setAuthMessage("Nao foi possivel fazer login.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setAuthMessage(null);
    const validation = registerSchema.safeParse(registerForm);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        errors[key] = issue.message;
      });
      setRegisterErrors(errors);
      return;
    }

    setRegisterErrors({});
    setRegisterLoading(true);
    try {
      await registerUser({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        date_of_birth: registerForm.date_of_birth,
        password: registerForm.password,
      });

      if (registerForm.autoLogin) {
        const result = await signIn("credentials", {
          redirect: false,
          email: registerForm.email,
          password: registerForm.password,
        });
        if (result?.error) {
          setAuthMessage(result.error);
          return;
        }
        router.push(redirectTo);
      } else {
        setTab("login");
        setAuthMessage("Conta criada. Agora faca login.");
      }
    } catch (error) {
      setAuthMessage("Nao foi possivel criar a conta.");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Autenticacao
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Acesse sua conta
        </h1>
        <p className="text-sm text-ink-600">
          Entre ou crie sua conta para continuar.
        </p>
      </header>

      <div className="flex gap-3 rounded-3xl bg-white p-2 shadow-soft">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
            tab === "login" ? "bg-ink-900 text-white" : "text-ink-600"
          }`}
        >
          Fazer login
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
            tab === "register" ? "bg-ink-900 text-white" : "text-ink-600"
          }`}
        >
          Criar conta
        </button>
      </div>

      {authMessage ? (
        <div className="rounded-3xl bg-white px-4 py-3 text-sm text-ink-600 shadow-soft">
          {authMessage}
        </div>
      ) : null}

      {tab === "login" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Email</label>
            <Input
              type="email"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm({ ...loginForm, email: event.target.value })
              }
              placeholder="seu@email.com"
              hasError={Boolean(loginErrors.email)}
            />
            {loginErrors.email ? (
              <p className="text-xs text-red-600">{loginErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Senha</label>
            <div className="relative">
              <Input
                type={showLoginPassword ? "text" : "password"}
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({ ...loginForm, password: event.target.value })
                }
                placeholder="Digite sua senha"
                hasError={Boolean(loginErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500"
                aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showLoginPassword ? (
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
            {loginErrors.password ? (
              <p className="text-xs text-red-600">{loginErrors.password}</p>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={handleLoginSubmit}
            className="h-12 w-full"
            disabled={loginLoading}
          >
            {loginLoading ? "Entrando..." : "Entrar"}
          </Button>

          <Link
            href="/password-reset"
            className="block text-center text-xs font-semibold text-ink-600 transition hover:text-ink-900"
          >
            Esqueci a minha senha
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Nome</label>
            <Input
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm({ ...registerForm, name: event.target.value })
              }
              placeholder="Nome completo"
              hasError={Boolean(registerErrors.name)}
            />
            {registerErrors.name ? (
              <p className="text-xs text-red-600">{registerErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Email</label>
            <Input
              type="email"
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm({ ...registerForm, email: event.target.value })
              }
              placeholder="voce@email.com"
              hasError={Boolean(registerErrors.email)}
            />
            {registerErrors.email ? (
              <p className="text-xs text-red-600">{registerErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Telefone</label>
            <Input
              type="tel"
              value={registerForm.phone}
              onChange={(event) =>
                setRegisterForm({ ...registerForm, phone: event.target.value })
              }
              placeholder="(00) 00000-0000"
              hasError={Boolean(registerErrors.phone)}
            />
            {registerErrors.phone ? (
              <p className="text-xs text-red-600">{registerErrors.phone}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">
              Data de nascimento
            </label>
            <Input
              type="date"
              value={registerForm.date_of_birth}
              onChange={(event) =>
                setRegisterForm({
                  ...registerForm,
                  date_of_birth: event.target.value,
                })
              }
              hasError={Boolean(registerErrors.date_of_birth)}
            />
            {registerErrors.date_of_birth ? (
              <p className="text-xs text-red-600">
                {registerErrors.date_of_birth}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">Senha</label>
            <div className="relative">
              <Input
                type={showRegisterPassword ? "text" : "password"}
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm({
                    ...registerForm,
                    password: event.target.value,
                  })
                }
                placeholder="Crie uma senha"
                hasError={Boolean(registerErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500"
                aria-label={
                  showRegisterPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showRegisterPassword ? (
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
            {registerErrors.password ? (
              <p className="text-xs text-red-600">{registerErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700">
              Confirmar senha
            </label>
            <div className="relative">
              <Input
                type={showRegisterConfirm ? "text" : "password"}
                value={registerForm.confirmPassword}
                onChange={(event) =>
                  setRegisterForm({
                    ...registerForm,
                    confirmPassword: event.target.value,
                  })
                }
                placeholder="Repita a senha"
                hasError={Boolean(registerErrors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowRegisterConfirm((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500"
                aria-label={
                  showRegisterConfirm ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showRegisterConfirm ? (
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
            {registerErrors.confirmPassword ? (
              <p className="text-xs text-red-600">
                {registerErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <label className="flex items-center gap-3 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={registerForm.autoLogin}
              onChange={(event) =>
                setRegisterForm({
                  ...registerForm,
                  autoLogin: event.target.checked,
                })
              }
              className="h-4 w-4 rounded border-ink-300 text-ink-900"
            />
            Fazer login automaticamente
          </label>

          <Button
            type="button"
            onClick={handleRegisterSubmit}
            className="h-12 w-full"
            disabled={registerLoading}
          >
            {registerLoading ? "Criando..." : "Criar conta"}
          </Button>
        </div>
      )}
    </div>
  );
};
