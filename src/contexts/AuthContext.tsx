import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockUsers } from "@/lib/mock-data";

export type UserRole = "patient" | "doctor" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("medtech-user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!user;

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock authentication - always succeeds with demo data
    const mockUser = mockUsers[role];
    const loggedInUser: User = {
      id: mockUser.id,
      name: mockUser.name,
      email: email || mockUser.email,
      role: role,
      avatar: mockUser.avatar,
    };
    
    setUser(loggedInUser);
    localStorage.setItem("medtech-user", JSON.stringify(loggedInUser));
    return true;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      avatar: mockUsers[role].avatar,
    };
    
    setUser(newUser);
    localStorage.setItem("medtech-user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("medtech-user");
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const mockUser = mockUsers[role];
      const updatedUser: User = {
        ...user,
        id: mockUser.id,
        name: mockUser.name,
        role,
        avatar: mockUser.avatar,
      };
      setUser(updatedUser);
      localStorage.setItem("medtech-user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, switchRole }}>
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
