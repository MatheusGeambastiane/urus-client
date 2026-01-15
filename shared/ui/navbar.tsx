"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LetterReveal } from "@/shared/ui/letter-reveal";

export const Navbar = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-20 bg-transparent backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-md items-center justify-center px-4 pb-4 pt-6">
        <div className="flex items-center gap-3">
    
          <div className="flex flex-col items-center">
            <LetterReveal
              text="URUS"
              className="font-logo text-lg font-bold uppercase tracking-[0.8em] text-ink-900"
              initialDelay={0.5}
              perLetterDelay={0.22}
              letterDuration={0.6}
              fadeInDelay={0.6}
              fadeInDuration={0.5}
            />
            <span className="font-logo text-[10px] font-semibold uppercase tracking-[0.4em] text-ink-500">
              BARBEARIA
            </span>
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-700 shadow-soft"
            aria-label="Menu do usuario"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M4 20C4.8 16.8 7.8 15 12 15C16.2 15 19.2 16.8 20 20"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {open ? (
            <div className="absolute right-0 mt-3 w-48 rounded-3xl bg-white p-3 shadow-soft">
              <div className="space-y-2 text-sm">
                {!session ? (
                  <>
                    <Link
                      href="/auth?tab=login&redirect=/"
                      className="block rounded-2xl px-3 py-2 text-ink-700 transition hover:bg-ink-100"
                      onClick={() => setOpen(false)}
                    >
                      Fazer login
                    </Link>
                    <Link
                      href="/auth?tab=register&redirect=/"
                      className="block rounded-2xl px-3 py-2 text-ink-700 transition hover:bg-ink-100"
                      onClick={() => setOpen(false)}
                    >
                      Criar conta
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-2xl px-3 py-2 text-left text-ink-700 transition hover:bg-ink-100"
                  >
                    Sair
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
