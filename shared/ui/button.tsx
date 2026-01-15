import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
};

export const Button = ({
  variant = "solid",
  className = "",
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    solid: "bg-ink-900 text-white hover:bg-ink-700",
    ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
