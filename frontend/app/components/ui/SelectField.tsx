import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className = "", label, helperText, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || props.name || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-4 py-3 bg-surface-700 border rounded-lg text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 transition-all duration-200 appearance-none ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-surface-600 focus:border-primary-500 focus:ring-primary-500"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-surface-400">{helperText}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
