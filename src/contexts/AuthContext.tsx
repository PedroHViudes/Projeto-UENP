import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, ROLE_LABELS } from '@/types/process';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', supabaseUser.id)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id)
    .single();

  if (!profile || !roleData) return null;

  return {
    id: supabaseUser.id,
    name: profile.name,
    email: profile.email,
    role: roleData.role as UserRole,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (error) return error.message;
    if (!data.user) return 'Erro ao criar usuário.';

    // Create profile and role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name, email });

    if (profileError) return profileError.message;

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role });

    if (roleError) return roleError.message;

    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
