import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { MenuIcon, UserIcon, LogoutIcon, SearchIcon } from "../icons/Icons";
import { Avatar } from "../ui";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 bg-surface-900/80 backdrop-blur-lg border-b border-surface-800/50">
      {/* Left side - Menu button (mobile) and navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-surface-300 hover:text-surface-100 transition-colors"
          aria-label="Toggle menu"
        >
          <MenuIcon size={24} />
        </button>

        {/* Navigation arrows - for desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-surface-300 hover:text-surface-100 transition-colors disabled:opacity-50"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            onClick={() => window.history.forward()}
            className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-surface-300 hover:text-surface-100 transition-colors disabled:opacity-50"
            aria-label="Go forward"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center - Search (mobile) */}
      <button
        onClick={() => navigate("/app/search")}
        className="lg:hidden p-2 text-surface-300 hover:text-surface-100 transition-colors"
        aria-label="Search"
      >
        <SearchIcon size={24} />
      </button>

      {/* Right side - User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 p-1 pr-3 rounded-full bg-surface-800 hover:bg-surface-700 transition-colors"
          aria-label="User menu"
          aria-expanded={isUserMenuOpen}
        >
          <Avatar
            src={user?.avatarUrl ?? undefined}
            alt={user?.displayName || user?.name || "User"}
            size="sm"
            fallback={user?.displayName?.charAt(0) || user?.name?.charAt(0) || "U"}
          />
          <span className="hidden sm:block text-sm font-medium text-surface-100 max-w-[120px] truncate">
            {user?.displayName || user?.name || "User"}
          </span>
        </button>

        {/* Dropdown menu */}
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 py-2 bg-surface-700 rounded-lg shadow-xl border border-surface-600 animate-fade-in">
            <div className="px-4 py-2 border-b border-surface-600">
              <p className="text-sm font-medium text-surface-100 truncate">
                {user?.displayName || user?.name || "User"}
              </p>
              {user?.name && (
                <p className="text-xs text-surface-400">@{user.name}</p>
              )}
            </div>

            <nav className="py-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate("/app/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-600 transition-colors"
              >
                <UserIcon size={18} />
                Profile
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-600 transition-colors"
              >
                <LogoutIcon size={18} />
                Log out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
