// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  branch: string | null;
  setAuth: (token: string, branch: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [branch, setBranch] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedBranch = localStorage.getItem("branch")
    if (savedToken) setToken(savedToken)
    if (savedBranch) setBranch(savedBranch)
  }, [])

  const setAuth = (newToken: string, newBranch: string) => {
    setToken(newToken);
    setBranch(newBranch);
    localStorage.setItem("token", newToken);
    localStorage.setItem("branch", newBranch);
  };

  const logout = () => {
    setToken(null);
    setBranch(null);
    localStorage.removeItem("token");
    localStorage.removeItem("branch");
  };

  return (
    <AuthContext.Provider value={{ token, branch, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
