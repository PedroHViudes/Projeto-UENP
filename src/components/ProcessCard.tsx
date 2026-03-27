import { Process } from '@/types/process';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Hash, Calendar, Layers, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessCardProps {
  process: Process;
  onClick: () => void;
}

export function ProcessCard({ process, onClick }: ProcessCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-border" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-mono font-semibold text-primary">{process.processNumber}</span>
            </div>
            <h3 className="font-semibold text-sm text-foreground truncate">{process.itemName}</h3>
          </div>
          <StatusBadge status={process.currentStatus} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Qtd: {process.quantity}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {process.isIT ? 'TI' : 'Geral'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {process.destination}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(process.createdAt), 'dd/MM/yy', { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
