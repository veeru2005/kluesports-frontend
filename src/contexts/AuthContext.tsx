import React, { createContext, useContext, useState, useEffect } from "react";
import { sendOTP as sendOTPService, verifyOTP } from "@/utils/otpService";

export type UserRole = "super_admin" | "admin_freefire" | "admin_bgmi" | "admin_valorant" | "admin_call_of_duty" | "user";

export interface User {
    id: string;
    email: string;
    username: string; // Used as In-Game Name fallback or display name
    name?: string;
    inGameName?: string;
    collegeId?: string;
    mobile?: string;
    bio?: string;
    role: UserRole;
    game?: "Free Fire" | "BGMI" | "Valorant" | "Call Of Duty";
    gameYouPlay?: "Free Fire" | "BGMI" | "Valorant" | "Call Of Duty"; // Backend field name match
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    role: UserRole | undefined; // Add role to context for easier access
    isLoading: boolean;
    login: (email: string, role?: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    signup: (email: string, username: string) => Promise<void>;
    sendOTP: (email: string, purpose: 'login' | 'signup', password?: string) => Promise<{ success: boolean; message: string }>;
    verifyLoginOTP: (email: string, otp: string) => Promise<void>;
    verifySignupOTP: (identifier: string, userData: any, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if session is expired based on token
    const isSessionExpired = () => {
        const token = localStorage.getItem("inferno_token");
        if (!token) return true;

        try {
            // Decode JWT to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Check JWT expiration
            if (payload.exp && payload.exp < currentTime) {
                return true;
            }
            
            // Check if login date is today
            if (payload.loginDate) {
                const currentDate = new Date().toISOString().split('T')[0];
                if (payload.loginDate !== currentDate) {
                    return true;
                }
            }
            
            // Check if session is within 6 hours
            if (payload.loginTimestamp) {
                const timeDiff = Date.now() - payload.loginTimestamp;
                const sixHours = 6 * 60 * 60 * 1000;
                if (timeDiff > sixHours) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            return true;
        }
    };

    const handleSessionExpiration = () => {
        setUser(null);
        localStorage.removeItem("inferno_user");
        localStorage.removeItem("inferno_token");
    };

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem("inferno_user");
        if (storedUser) {
            // Check if session is still valid
            if (!isSessionExpired()) {
                setUser(JSON.parse(storedUser));
            } else {
                handleSessionExpiration();
            }
        }
        setIsLoading(false);

        // Set up periodic session check (every minute)
        const intervalId = setInterval(() => {
            if (isSessionExpired()) {
                handleSessionExpiration();
            }
        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, []);

    const determineRole = (email: string): UserRole => {
        const lowerEmail = email.toLowerCase();
        
        // Check against super admin emails
        const superAdminEmails = [
            'superadmin1@klu.ac.in',
            'superadmin2@klu.ac.in',
            'superadmin3@klu.ac.in'
        ];
        
        if (superAdminEmails.includes(lowerEmail)) return "super_admin";
        if (lowerEmail.includes("freefire")) return "admin_freefire";
        if (lowerEmail.includes("bgmi")) return "admin_bgmi";
        if (lowerEmail.includes("valorant")) return "admin_valorant";
        if (lowerEmail.includes("callofduty")) return "admin_call_of_duty";
        return "user";
    };

    const login = async (email: string, role: UserRole = "user") => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const determinedRole = determineRole(email);

        const mockUser: User = {
            id: "mock-user-" + Math.random().toString(36).substr(2, 9),
            email,
            username: email.split("@")[0],
            role: determinedRole,
        };

        setUser(mockUser);
        localStorage.setItem("inferno_user", JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const signup = async (email: string, username: string) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: User = {
            id: "mock-user-" + Math.random().toString(36).substr(2, 9),
            email,
            username,
            role: "user" // Default to user for signup
        };

        setUser(mockUser);
        localStorage.setItem("inferno_user", JSON.stringify(mockUser));
        setIsLoading(false);
    }

    const logout = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser(null);
        localStorage.removeItem("inferno_user");
        localStorage.removeItem("inferno_token");
        setIsLoading(false);
    };

    const sendOTP = async (email: string, purpose: 'login' | 'signup', password?: string) => {
        return sendOTPService(email, purpose, password);
    };

    const verifyLoginOTP = async (email: string, otp: string) => {
        setIsLoading(true);

        const result = await verifyOTP(email, otp, 'login');

        if (!result.success || !result.user) {
            setIsLoading(false);
            throw new Error(result.message || "Login failed");
        }

        const user: User = result.user;
        const token = result.token;

        setUser(user);
        localStorage.setItem("inferno_user", JSON.stringify(user));
        if (token) localStorage.setItem("inferno_token", token);
        setIsLoading(false);
    };

    const verifySignupOTP = async (identifier: string, userData: any, otp: string) => {
        setIsLoading(true);

        // Pass full userData to backend for account creation
        const result = await verifyOTP(identifier, otp, 'signup', userData);

        if (!result.success || !result.user) {
            setIsLoading(false);
            throw new Error(result.message || "Signup failed");
        }

        const user: User = result.user;
        const token = result.token;

        setUser(user);
        localStorage.setItem("inferno_user", JSON.stringify(user));
        if (token) localStorage.setItem("inferno_token", token);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAdmin: user?.role?.includes("admin") || false,
                role: user?.role,
                isLoading,
                login,
                logout,
                signup,
                sendOTP,
                verifyLoginOTP,
                verifySignupOTP
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
