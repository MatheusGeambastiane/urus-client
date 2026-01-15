import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = ({ className = "", hasError, ...props }: InputProps) => {
  return (
    <input
      className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-ink-900 ${
        hasError ? "border-red-500" : "border-ink-200"
      } ${className}`}
      {...props}
    />
  );
};
