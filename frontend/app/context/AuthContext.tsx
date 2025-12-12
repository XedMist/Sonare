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

function createFallbackUser(username: string): User {
    const now = new Date().toISOString();
    return {
        id: "",
        name: username,
        roleID: "",
        createdAt: now,
        updatedAt: now,
    };
}


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
                // Ideally validate token / fetch user profile
                const profile = await authApi.getProfile?.();
                setUser(profile ?? null);
            } catch {
                // Token invalid → clear & unauthenticate
                tokenStorage.clear();
                setUser(null);
            }

            setIsLoading(false);
        };

        loadUserFromToken();
    }, []);

    // --- LOGIN --------------------------------------------------------------
    const login = useCallback(async (credentials: LoginRequest) => {
        const response = await authApi.login(credentials);

        let userData = response.user;
        if (!userData) {
            userData = createFallbackUser(credentials.username);
        }

        setUser(userData);
    }, []);

    // --- REGISTER -----------------------------------------------------------
    const register = useCallback(
        async (data: RegisterRequest) => {
            await authApi.register(data);

            // Optional: Automatically log in after registration
            await login({ username: data.name, password: data.password });
        },
        [login]
    );

    // --- LOGOUT -------------------------------------------------------------
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            tokenStorage.clear();
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
