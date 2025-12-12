import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-surface-700 border rounded-lg text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 transition-all ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-surface-600 focus:border-primary-500 focus:ring-primary-500"
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
