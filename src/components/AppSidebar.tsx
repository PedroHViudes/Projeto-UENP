import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/process';
import { LayoutDashboard, LogOut, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
          <Package className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-sidebar-foreground">TrackFlow</h1>
          <p className="text-xs text-sidebar-muted">Gestão de Processos</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sidebar-accent">
            <User className="w-4 h-4 text-sidebar-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-muted">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
