import { useState } from 'react';
import { Process } from '@/types/process';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from './StatusBadge';
import { ProcessTimeline } from './ProcessTimeline';
import { ProcessActions } from './ProcessActions';
import { EditProcessDialog } from './EditProcessDialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Hash, Package, Layers, Calendar, User, MapPin, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProcesses } from '@/contexts/ProcessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProcessDetailSheetProps {
  process: Process | null;
  onClose: () => void;
}

export function ProcessDetailSheet({ process: initialProcess, onClose }: ProcessDetailSheetProps) {
  const { getProcess, deleteProcess } = useProcesses();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const process = initialProcess ? getProcess(initialProcess.id) ?? initialProcess : null;
  const isAdmin = user?.role === 'admin';

  const handleDelete = () => {
    if (!process) return;
    deleteProcess(process.id);
    toast({ title: 'Processo excluído', description: `${process.processNumber} foi removido.` });
    setDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Sheet open={!!process} onOpenChange={open => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {process && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    <span className="text-sm font-mono font-semibold text-primary">{process.processNumber}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <SheetTitle className="text-left">{process.itemName}</SheetTitle>
                <div className="mt-2">
                  <StatusBadge status={process.currentStatus} />
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={<Layers className="w-4 h-4" />} label="Quantidade" value={String(process.quantity)} />
                  <InfoItem icon={<Package className="w-4 h-4" />} label="Tipo" value={process.isIT ? 'Tecnologia da Informação' : 'Material Geral'} />
                  <InfoItem icon={<User className="w-4 h-4" />} label="Criado por" value={process.createdByName} />
                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Data" value={format(new Date(process.createdAt), "dd/MM/yyyy", { locale: ptBR })} />
                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="Destino" value={process.destination} />
                </div>

                <Separator />

                {process.currentStatus !== 'entregue' && (
                  <>
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Ações Disponíveis</h3>
                      <ProcessActions process={process} />
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <h3 className="font-semibold text-sm mb-4">Linha do Tempo</h3>
                  <ProcessTimeline entries={process.timeline} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {process && isAdmin && (
        <>
          <EditProcessDialog process={process} open={editOpen} onOpenChange={setEditOpen} />
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir processo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O processo {process.processNumber} será permanentemente removido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
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
