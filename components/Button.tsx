// Renders the reusable Button UI component.
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "elevated" | "plain";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-all sm:px-6 sm:text-base",
        "shadow-md hover:shadow-lg",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#6155F5] text-white hover:bg-[#503fdc] focus:outline-none focus:ring-2 focus:ring-[#6155F5] focus:ring-offset-2 focus:ring-offset-white dark:hover:bg-[#756cff] dark:focus:ring-offset-neutral-950",
  elevated:
    "border border-transparent bg-white text-[#6155F5] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6155F5] focus:ring-offset-2 focus:ring-offset-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-violet-300 dark:hover:bg-neutral-800 dark:focus:ring-offset-neutral-950",
  plain: "bg-transparent hover:shadow-none focus:ring-0",
};
