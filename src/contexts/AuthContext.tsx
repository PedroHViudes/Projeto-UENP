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

// Multiple users per sector for tracking who did what
const MOCK_USERS: (User & { password: string })[] = [
  // Planejamento
  { id: '1', name: 'Ana Silva', email: 'ana.planejamento@gov.br', password: '123456', role: 'planejamento' },
  { id: '6', name: 'Roberto Costa', email: 'roberto.planejamento@gov.br', password: '123456', role: 'planejamento' },
  // Almoxarifado
  { id: '2', name: 'Carlos Souza', email: 'carlos.almoxarifado@gov.br', password: '123456', role: 'almoxarifado' },
  { id: '7', name: 'Mariana Oliveira', email: 'mariana.almoxarifado@gov.br', password: '123456', role: 'almoxarifado' },
  // NTI
  { id: '3', name: 'Diego Martins', email: 'diego.nti@gov.br', password: '123456', role: 'nti' },
  { id: '8', name: 'Juliana Rocha', email: 'juliana.nti@gov.br', password: '123456', role: 'nti' },
  // Patrimônio
  { id: '4', name: 'Fernanda Lima', email: 'fernanda.patrimonio@gov.br', password: '123456', role: 'patrimonio' },
  { id: '9', name: 'Paulo Mendes', email: 'paulo.patrimonio@gov.br', password: '123456', role: 'patrimonio' },
  // Admin
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
