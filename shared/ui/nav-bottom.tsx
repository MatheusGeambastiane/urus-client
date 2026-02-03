"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/appointments", label: "Meus agendamentos", icon: "calendar" },
  { href: "/info", label: "Informações", icon: "location" },
] as const;

export const NavBottom = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-20">
      <div className="mx-auto flex w-full max-w-md items-center justify-center px-4">
        <div className="flex w-full items-center justify-between rounded-[40px] bg-white px-8 py-3 shadow-soft">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 text-xs font-semibold transition ${
                  isActive ? "text-ink-900" : "text-ink-500"
                }`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-100">
                  {item.icon === "home" ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 10.5L12 4L20 10.5V20C20 20.6 19.6 21 19 21H5C4.4 21 4 20.6 4 20V10.5Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : item.icon === "calendar" ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="17"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M7 2V6M17 2V6M3 9H21"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C15.5 18.5 19 15.4 19 11.2C19 7.2 15.9 4 12 4C8.1 4 5 7.2 5 11.2C5 15.4 8.5 18.5 12 22Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="11"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  )}
                </span>
                <span className="min-h-[28px] text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
