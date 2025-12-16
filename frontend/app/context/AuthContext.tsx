import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as authApi from "../api/auth";
import * as meApi from "../api/me";
import { tokenStorage } from "../api/client";
import type { User, LoginRequest, RegisterRequest, UserProfileUpdateRequest } from "../types";

interface AuthContextState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<User>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<User | null>;
    updateProfile: (data: UserProfileUpdateRequest) => Promise<User>;
    uploadAvatar: (file: File) => Promise<User>;
}

const AuthContext = createContext<AuthContextState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async (): Promise<User | null> => {
        const profile = await authApi.getProfile();
        setUser(profile ?? null);
        return profile ?? null;
    }, []);

    useEffect(() => {
        const loadUserFromToken = async () => {
            const token = tokenStorage.getAccessToken();

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                await fetchProfile();
            } catch {
                tokenStorage.clearTokens();
                setUser(null);
            }

            setIsLoading(false);
        };

        loadUserFromToken();
    }, [fetchProfile]);

    const login = useCallback(async (credentials: LoginRequest): Promise<User> => {
        await authApi.login(credentials);

        try {
            const profile = await fetchProfile();
            if (profile) return profile;
        } catch {
            
        }

        const fallbackUser: User = {
            id: "",
            name: credentials.username,
            displayName: credentials.username,
            roleID: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
        return fallbackUser;
    }, [fetchProfile]);

    const register = useCallback(
        async (data: RegisterRequest) => {
            await authApi.register(data);
            await login({ username: data.name, password: data.password });
        },
        [login]
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            tokenStorage.clearTokens();
            setUser(null);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        try {
            return await fetchProfile();
        } catch {
            return null;
        }
    }, [fetchProfile]);

    const updateProfile = useCallback(async (data: UserProfileUpdateRequest) => {
        const updated = await meApi.updateProfile(data);
        setUser(updated);
        return updated;
    }, []);

    const uploadAvatar = useCallback(async (file: File) => {
        const updated = await meApi.uploadAvatar(file);
        setUser(updated);
        return updated;
    }, []);

    const value: AuthContextState = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        uploadAvatar,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
