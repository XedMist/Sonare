import { type ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "ghost";
  "aria-label": string;
}

export function IconButton({
  className = "",
  size = "md",
  variant = "default",
  children,
  ...props
}: IconButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    default: "text-surface-300 hover:text-surface-100 hover:bg-surface-700 focus:ring-surface-400",
    primary: "text-surface-100 bg-primary-500 hover:bg-primary-400 hover:scale-105 focus:ring-primary-500",
    ghost: "text-surface-400 hover:text-surface-100 focus:ring-surface-400",
  };

  const sizeStyles = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
