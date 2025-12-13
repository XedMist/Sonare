import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "../icons/Icons";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onOpenChange(false)}
    >
      {children}
    </div>
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  return (
    <div
      className={`bg-surface-800 border border-surface-700 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: ReactNode;
  onClose?: () => void;
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-surface-100">{children}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-surface-400 hover:text-surface-100 transition-colors"
        >
          <CloseIcon size={20} />
        </button>
      )}
    </div>
  );
}

interface DialogFooterProps {
  children: ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="flex justify-end gap-3 mt-6">{children}</div>;
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return (
    <h3 className={`text-xl font-bold text-surface-100 ${className}`}>
      {children}
    </h3>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  // This is a passthrough component - the Dialog component is controlled
  // The parent should handle the open state
  return <>{children}</>;
}

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function DialogDescription({ children, className = "" }: DialogDescriptionProps) {
  return (
    <p className={`text-surface-400 text-sm ${className}`}>
      {children}
    </p>
  );
}
