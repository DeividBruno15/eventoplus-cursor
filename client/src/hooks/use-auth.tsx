import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  email: string;
  userType: "prestador" | "contratante" | "anunciante";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string, userType: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Auth query error:", error);
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Aguarda a query ser refetchada
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, email, password, userType }: { 
      username: string; 
      email: string; 
      password: string; 
      userType: string; 
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", { 
        username, 
        email, 
        password, 
        userType 
      });
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Aguarda a query ser refetchada
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      // Redirect to login after logout
      setLocation("/auth/login");
    },
  });

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (error: any) {
      // Handle email verification errors specially
      if (error.message?.includes("E-mail não verificado") || error.message?.includes("emailVerificationRequired")) {
        // Store email for the verification page
        localStorage.setItem("unverifiedEmail", email);
        
        return { 
          success: false, 
          error: error.message || "E-mail não verificado",
          redirectTo: "/auth/email-not-verified"
        };
      }
      
      return { 
        success: false, 
        error: error.message || "Erro ao fazer login" 
      };
    }
  };

  const register = async (username: string, email: string, password: string, userType: string) => {
    await registerMutation.mutateAsync({ username, email, password, userType });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
