"use client";
import { createContext, useContext, ReactNode, useState } from "react";

interface LoginContextType {
  username: string;
  branch: string;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

interface LoginProviderProps {
  children: ReactNode;
  initialUsername: string;
  initialBranch: string;
}

export function LoginProvider({
  children,
  initialUsername,
  initialBranch,
}: LoginProviderProps) {
  const [username, setUsername] = useState<string>(initialUsername);
  const [branch, setBranch] = useState<string>(initialBranch);

  return (
    <LoginContext.Provider value={{ username, branch }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLoginContext() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLoginContext must be used within an LoginProvider");
  }
  return context;
}
