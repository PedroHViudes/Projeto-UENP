import { useState } from 'react';
import { useProcesses } from '@/contexts/ProcessContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessCard } from '@/components/ProcessCard';
import { CreateProcessDialog } from '@/components/CreateProcessDialog';
import { ProcessDetailSheet } from '@/components/ProcessDetailSheet';
import { AppSidebar } from '@/components/AppSidebar';
import { Process, ProcessStatus, STATUS_LABELS } from '@/types/process';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { processes } = useProcesses();
  const { user } = useAuth();
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = processes.filter(p => {
    const matchesSearch = p.itemName.toLowerCase().includes(search.toLowerCase()) ||
      p.processNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: processes.length,
    aguardando: processes.filter(p => p.currentStatus === 'aguardando_recebimento').length,
    emAndamento: processes.filter(p => !['aguardando_recebimento', 'entregue', 'pendencia_fornecedor'].includes(p.currentStatus)).length,
    pendencias: processes.filter(p => ['em_desacordo', 'pendencia_fornecedor'].includes(p.currentStatus)).length,
    concluidos: processes.filter(p => p.currentStatus === 'entregue').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Acompanhe seus processos de compras e entregas</p>
            </div>
            {(user?.role === 'planejamento' || user?.role === 'admin') && (
              <CreateProcessDialog />
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Package className="w-5 h-5" />} label="Total de Processos" value={stats.total} color="primary" />
            <StatCard icon={<Clock className="w-5 h-5" />} label="Aguardando" value={stats.aguardando} color="warning" />
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Pendências" value={stats.pendencias} color="danger" />
            <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Concluídos" value={stats.concluidos} color="success" />
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar processo..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(process => (
              <ProcessCard key={process.id} process={process} onClick={() => setSelectedProcess(process)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum processo encontrado</p>
            </div>
          )}
        </div>
      </main>

      <ProcessDetailSheet process={selectedProcess} onClose={() => setSelectedProcess(null)} />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const bgMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-status-warning/10 text-status-warning',
    danger: 'bg-status-danger/10 text-status-danger',
    success: 'bg-status-success/10 text-status-success',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${bgMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
