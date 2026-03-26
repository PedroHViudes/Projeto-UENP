import { useState } from 'react';
import { Process } from '@/types/process';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PackageCheck, Send, CheckCircle2, XCircle, Stamp, Truck } from 'lucide-react';

interface ProcessActionsProps {
  process: Process;
}

export function ProcessActions({ process }: ProcessActionsProps) {
  const { user } = useAuth();
  const { advanceProcess } = useProcesses();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');

  if (!user) return null;

  const role = user.role;
  const status = process.currentStatus;

  const doAction = (action: string, agreement?: 'de_acordo' | 'em_desacordo') => {
    advanceProcess(process.id, action, notes || undefined, agreement);
    toast({ title: 'Processo atualizado', description: 'Ação registrada com sucesso.' });
    setNotes('');
  };

  const canAct = (allowedRoles: string[], allowedStatuses: string[]) =>
    (allowedRoles.includes(role) || role === 'admin') && allowedStatuses.includes(status);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea placeholder="Adicione observações sobre esta ação..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {canAct(['almoxarifado'], ['aguardando_recebimento']) && (
          <Button onClick={() => doAction('receber')} className="gap-2">
            <PackageCheck className="w-4 h-4" /> Registrar Recebimento
          </Button>
        )}

        {canAct(['almoxarifado'], ['recebido_almoxarifado']) && process.isIT && (
          <Button onClick={() => doAction('enviar_nti')} className="gap-2">
            <Send className="w-4 h-4" /> Encaminhar ao NTI
          </Button>
        )}

        {canAct(['almoxarifado'], ['recebido_almoxarifado']) && !process.isIT && (
          <Button onClick={() => doAction('conferencia_almox')} className="gap-2">
            <PackageCheck className="w-4 h-4" /> Iniciar Conferência
          </Button>
        )}

        {canAct(['nti'], ['conferencia_nti']) && (
          <>
            <Button onClick={() => doAction('parecer', 'de_acordo')} className="gap-2 bg-status-success hover:bg-status-success/90">
              <CheckCircle2 className="w-4 h-4" /> De Acordo
            </Button>
            <Button onClick={() => doAction('parecer', 'em_desacordo')} variant="destructive" className="gap-2">
              <XCircle className="w-4 h-4" /> Em Desacordo
            </Button>
          </>
        )}

        {canAct(['almoxarifado'], ['conferencia_almoxarifado']) && (
          <>
            <Button onClick={() => doAction('parecer', 'de_acordo')} className="gap-2 bg-status-success hover:bg-status-success/90">
              <CheckCircle2 className="w-4 h-4" /> De Acordo
            </Button>
            <Button onClick={() => doAction('parecer', 'em_desacordo')} variant="destructive" className="gap-2">
              <XCircle className="w-4 h-4" /> Em Desacordo
            </Button>
          </>
        )}

        {canAct(['almoxarifado'], ['em_desacordo']) && (
          <Button onClick={() => doAction('pendencia_fornecedor')} variant="outline" className="gap-2">
            <Send className="w-4 h-4" /> Registrar Pendência Fornecedor
          </Button>
        )}

        {canAct(['patrimonio'], ['de_acordo']) && (
          <Button onClick={() => doAction('patrimonio')} className="gap-2">
            <Stamp className="w-4 h-4" /> Tombamento Patrimonial
          </Button>
        )}

        {canAct(['patrimonio'], ['patrimonio']) && (
          <Button onClick={() => doAction('entregar')} className="gap-2 bg-status-success hover:bg-status-success/90">
            <Truck className="w-4 h-4" /> Registrar Entrega Final
          </Button>
        )}
      </div>
    </div>
  );
}
