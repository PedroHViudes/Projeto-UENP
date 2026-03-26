import { Process } from '@/types/process';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from './StatusBadge';
import { ProcessTimeline } from './ProcessTimeline';
import { ProcessActions } from './ProcessActions';
import { Separator } from '@/components/ui/separator';
import { Hash, Package, Layers, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProcesses } from '@/contexts/ProcessContext';

interface ProcessDetailSheetProps {
  process: Process | null;
  onClose: () => void;
}

export function ProcessDetailSheet({ process: initialProcess, onClose }: ProcessDetailSheetProps) {
  const { getProcess } = useProcesses();
  // Always get latest version from context
  const process = initialProcess ? getProcess(initialProcess.id) ?? initialProcess : null;

  return (
    <Sheet open={!!process} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {process && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono font-semibold text-primary">{process.processNumber}</span>
              </div>
              <SheetTitle className="text-left">{process.itemName}</SheetTitle>
              <div className="mt-2">
                <StatusBadge status={process.currentStatus} />
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<Layers className="w-4 h-4" />} label="Quantidade" value={String(process.quantity)} />
                <InfoItem icon={<Package className="w-4 h-4" />} label="Tipo" value={process.isIT ? 'Tecnologia da Informação' : 'Material Geral'} />
                <InfoItem icon={<User className="w-4 h-4" />} label="Criado por" value={process.createdByName} />
                <InfoItem icon={<Calendar className="w-4 h-4" />} label="Data" value={format(new Date(process.createdAt), "dd/MM/yyyy", { locale: ptBR })} />
              </div>

              <Separator />

              {/* Actions */}
              {process.currentStatus !== 'entregue' && (
                <>
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Ações Disponíveis</h3>
                    <ProcessActions process={process} />
                  </div>
                  <Separator />
                </>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-sm mb-4">Linha do Tempo</h3>
                <ProcessTimeline entries={process.timeline} />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
