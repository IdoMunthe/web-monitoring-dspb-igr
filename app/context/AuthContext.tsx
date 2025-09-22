// src/context/AuthContext.tsx
"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  branch: string | null;
  username: string | null;
  setAuth: (token: string, branch: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedBranch = localStorage.getItem("branch")
    const savedUsername = localStorage.getItem("username")
    if (savedToken) setToken(savedToken)
    if (savedBranch) setBranch(savedBranch)
    if (savedUsername) setBranch(savedUsername)
  }, [])

  const setAuth = (newToken: string, newBranch: string, newUsername: string) => {
    setToken(newToken);
    setBranch(newBranch);
    setUsername(newUsername);
    localStorage.setItem("token", newToken);
    localStorage.setItem("branch", newBranch);
    localStorage.setItem("username", newUsername);
  };

  const logout = () => {
    router.push("/login");
    setTimeout(() => {
      setToken(null);
      setBranch(null);
      setUsername(null);
      localStorage.removeItem("token");
      localStorage.removeItem("branch");
      localStorage.removeItem("username");
    }, 0);
  };


  return (
    <AuthContext.Provider value={{ token, branch, username, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
