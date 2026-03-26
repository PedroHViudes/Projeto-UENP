import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, ROLE_LABELS } from '@/types/process';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Ana Silva', email: 'planejamento@gov.br', password: '123456', role: 'planejamento' },
  { id: '2', name: 'Carlos Souza', email: 'almoxarifado@gov.br', password: '123456', role: 'almoxarifado' },
  { id: '3', name: 'Diego Martins', email: 'nti@gov.br', password: '123456', role: 'nti' },
  { id: '4', name: 'Fernanda Lima', email: 'patrimonio@gov.br', password: '123456', role: 'patrimonio' },
  { id: '5', name: 'Admin', email: 'admin@gov.br', password: '123456', role: 'admin' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
