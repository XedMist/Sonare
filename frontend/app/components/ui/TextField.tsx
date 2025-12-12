import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-surface-700 border rounded-lg text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 transition-all duration-200 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-surface-600 focus:border-primary-500 focus:ring-primary-500"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-surface-400">{helperText}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
