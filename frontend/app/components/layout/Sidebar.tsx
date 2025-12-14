import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import * as playlistsApi from "../../api/playlists";
import { ScrollArea, DropdownMenu, DropdownItem, DropdownSeparator, Avatar } from "../ui";
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  PlusIcon,
  MusicNoteIcon,
  UserIcon,
  LogoutIcon,
  MoreIcon,
} from "../icons/Icons";
import type { Playlist } from "../../types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCreatePlaylist?: () => void;
}

const navItems = [
  { to: "/app", icon: HomeIcon, label: "Home", end: true },
  { to: "/app/search", icon: SearchIcon, label: "Search" },
  { to: "/app/library", icon: LibraryIcon, label: "Your Library" },
];

export function Sidebar({ isOpen = true, onClose, onCreatePlaylist }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchPlaylists() {
      try {
        const response = await playlistsApi.getPlaylists({ limit: 50 });
        if (isMounted) {
          setPlaylists(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch playlists:", err);
        }
      }
    }
    fetchPlaylists();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-900 border-r border-surface-800/50 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col h-full`}
      >
        <div className="p-6">
          <NavLink to="/app" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <MusicNoteIcon size={24} className="text-surface-100" />
            </div>
            <span className="text-xl font-bold text-surface-100 group-hover:text-primary-400 transition-colors">
              Sonare
            </span>
          </NavLink>
        </div>

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
                        ? "bg-surface-700/80 text-surface-100 border-l-2 border-primary-500"
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

        <div className="mt-6 px-3 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
              Your Playlists
            </h3>
            <button
              onClick={onCreatePlaylist}
              className="p-1.5 text-surface-400 hover:text-surface-100 hover:bg-surface-700 rounded-full transition-all"
              aria-label="Create playlist"
            >
              <PlusIcon size={18} />
            </button>
          </div>

          <ScrollArea className="flex-1 px-2">
            {playlists.length > 0 ? (
              <nav className="space-y-0.5">
                {playlists.map((playlist) => (
                  <NavLink
                    key={playlist.id}
                    to={`/app/playlists/${playlist.id}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-surface-700/80 text-surface-100"
                          : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
                      }`
                    }
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <span className="truncate">{playlist.name}</span>
                  </NavLink>
                ))}
              </nav>
            ) : (
              <p className="px-3 py-2 text-sm text-surface-500">
                No playlists yet
              </p>
            )}
          </ScrollArea>
        </div>

        <div className="p-3 border-t border-surface-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigate("/app/profile");
                onClose?.();
              }}
              className="flex-1 flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800 transition-colors text-left group"
            >
              <Avatar
                src={user?.avatarUrl ?? undefined}
                alt={user?.displayName || user?.name || "User"}
                size="sm"
                fallback={user?.name?.charAt(0).toUpperCase() || "U"}
                className="ring-1 ring-surface-700"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-100 truncate">
                  {user?.displayName || user?.name || "User"}
                </p>
                {user?.name && (
                  <p className="text-xs text-surface-500 truncate">@{user.name}</p>
                )}
              </div>
            </button>

            <DropdownMenu
              trigger={
                <button
                  aria-label="Abrir acciones de cuenta"
                  className="p-2 rounded-full hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
                >
                  <MoreIcon size={18} />
                </button>
              }
            >
              <DropdownItem onClick={() => navigate("/app/profile") }>
                <UserIcon size={18} />
                Perfil
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={handleLogout}>
                <LogoutIcon size={18} />
                Log out
              </DropdownItem>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
