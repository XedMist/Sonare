interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallback?: string;
}

export function Avatar({ src, alt, size = "md", className = "", fallback }: AvatarProps) {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const initials = fallback || alt.charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeStyles[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} rounded-full bg-surface-600 flex items-center justify-center font-medium text-surface-300 ${className}`}
      aria-label={alt}
    >
      {initials}
    </div>
  );
}

interface ArtworkProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Artwork({
  src,
  alt,
  size = "md",
  className = "",
  rounded = "md",
}: ArtworkProps) {
  const sizeStyles = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    full: "w-full aspect-square",
  };

  const roundedStyles = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeStyles[size]} ${roundedStyles[rounded]} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} ${roundedStyles[rounded]} bg-surface-700 flex items-center justify-center ${className}`}
      aria-label={alt}
    >
      <svg
        className="w-1/3 h-1/3 text-surface-500"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    </div>
  );
}
