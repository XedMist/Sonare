import { NavLink, useNavigate } from "react-router";
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  PlusIcon,
  MusicNoteIcon,
} from "../icons/Icons";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: "/app", icon: HomeIcon, label: "Home", end: true },
  { to: "/app/search", icon: SearchIcon, label: "Search" },
  { to: "/app/library", icon: LibraryIcon, label: "Your Library" },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleCreatePlaylist = () => {
    // TODO: Implement playlist creation modal
    console.log("Create playlist");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-900 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col h-full`}
      >
        {/* Logo */}
        <div className="p-6">
          <NavLink to="/app" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <MusicNoteIcon size={24} className="text-surface-900" />
            </div>
            <span className="text-xl font-bold text-surface-100 group-hover:text-primary-400 transition-colors">
              Sonare
            </span>
          </NavLink>
        </div>

        {/* Main navigation */}
        <nav className="px-3">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-surface-700 text-surface-100"
                        : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
                    }`
                  }
                >
                  <Icon size={24} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Library section */}
        <div className="mt-6 px-3 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
              Playlists
            </h3>
            <button
              onClick={handleCreatePlaylist}
              className="p-1 text-surface-400 hover:text-surface-100 transition-colors"
              aria-label="Create playlist"
            >
              <PlusIcon size={20} />
            </button>
          </div>

          {/* Playlist links - scrollable area */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-1">
              {/* Placeholder playlists - will be populated dynamically */}
              <p className="px-4 py-2 text-sm text-surface-500">
                Your playlists will appear here
              </p>
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-surface-800">
          <p className="text-xs text-surface-500 text-center">
            © 2025 Sonare
          </p>
        </div>
      </aside>
    </>
  );
}
