import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { tokenStorage } from "../api/client";
import type { User, LoginRequest, RegisterRequest } from "../types";

interface AuthContextState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- AUTH BOOTSTRAP ON REFRESH -----------------------------------------
    useEffect(() => {
        const loadUserFromToken = async () => {
            const token = tokenStorage.getAccessToken();

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch user profile using the stored token
                const profile = await authApi.getProfile();
                setUser(profile ?? null);
            } catch {
                // Token invalid → clear & unauthenticate
                tokenStorage.clearTokens();
                setUser(null);
            }

            setIsLoading(false);
        };

        loadUserFromToken();
    }, []);

    // --- LOGIN --------------------------------------------------------------
    const login = useCallback(async (credentials: LoginRequest) => {
        // Login returns { accessToken, refreshToken } - no user
        await authApi.login(credentials);
        
        // Fetch user profile after successful login
        try {
            const profile = await authApi.getProfile();
            setUser(profile);
        } catch {
            // Profile fetch failed but we're logged in - create minimal user
            setUser({
                id: "",
                name: credentials.username,
                roleID: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }, []);

    // --- REGISTER -----------------------------------------------------------
    const register = useCallback(
        async (data: RegisterRequest) => {
            await authApi.register(data);

            // Automatically log in after registration
            await login({ username: data.name, password: data.password });
        },
        [login]
    );

    // --- LOGOUT -------------------------------------------------------------
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            tokenStorage.clearTokens();
            setUser(null);
        }
    }, []);

    const value: AuthContextState = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
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
