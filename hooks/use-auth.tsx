"use client";

import { authenticateUser } from "@/services/auth-service";
import { User } from "@/types/common";
import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  reAuthenticate: () => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const reAuthenticate = (): User | null => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("bankmate-user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id && parsedUser.name) {
            setUser(parsedUser);
            return parsedUser;
          } else {
            localStorage.removeItem("bankmate-user");
            return null;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load user session:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("bankmate-user");
      }
      return null;
    }
    setIsLoading(false);
    return null;
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const authenticatedUser = await authenticateUser(username, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "bankmate-user",
            JSON.stringify(authenticatedUser)
          );
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("bankmate-user");
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, reAuthenticate }}
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
