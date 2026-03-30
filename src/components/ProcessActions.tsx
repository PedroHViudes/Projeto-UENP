import { useState } from 'react';
import { Process } from '@/types/process';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';
import { PackageCheck, Send, CheckCircle2, XCircle, Stamp, Truck, RotateCcw, MessageSquarePlus, ShieldCheck } from 'lucide-react';

interface ProcessActionsProps {
  process: Process;
}

export function ProcessActions({ process }: ProcessActionsProps) {
  const { user } = useAuth();
  const { advanceProcess, addObservation, addAttachment, removeAttachment } = useProcesses();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [obsText, setObsText] = useState('');

  if (!user) return null;

  const role = user.role;
  const status = process.currentStatus;

  const doAction = (action: string, agreement?: 'de_acordo' | 'em_desacordo') => {
    advanceProcess(process.id, action, notes || undefined, agreement);
    toast({ title: 'Processo atualizado', description: 'Ação registrada com sucesso.' });
    setNotes('');
  };

  const handleAddObservation = () => {
    if (!obsText.trim()) return;
    addObservation(process.id, obsText.trim());
    toast({ title: 'Observação registrada', description: 'Observação adicionada à linha do tempo.' });
    setObsText('');
  };

  const canAct = (allowedRoles: string[], allowedStatuses: string[]) =>
    (allowedRoles.includes(role) || role === 'admin') && allowedStatuses.includes(status);

  const sectorOwnsProcess = () => {
    if (role === 'admin') return true;
    const sectorMap: Record<string, string[]> = {
      almoxarifado: ['recebido_almoxarifado', 'conferencia_almoxarifado', 'de_acordo', 'em_desacordo', 'pendencia_fornecedor', 'aguardando_recebimento'],
      nti: ['conferencia_nti'],
      patrimonio: ['patrimonio'],
      planejamento: ['aguardando_recebimento'],
    };
    return sectorMap[role]?.includes(status) ?? false;
  };

  const hasFCT = process.attachments.some(a => a.type === 'fct');
  const hasTermo = process.attachments.some(a => a.type === 'termo_incorporacao');

  return (
    <div className="space-y-4">
      {/* Observation section */}
      {sectorOwnsProcess() && (
        <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/30">
          <Label className="text-xs font-medium">Registrar Observação</Label>
          <Textarea placeholder="Digite uma observação sobre o andamento..." value={obsText} onChange={e => setObsText(e.target.value)} className="min-h-[60px]" />
          <Button variant="outline" size="sm" onClick={handleAddObservation} disabled={!obsText.trim()} className="gap-2">
            <MessageSquarePlus className="w-4 h-4" /> Registrar Observação
          </Button>
        </div>
      )}

      {/* FCT upload - before sending to patrimônio */}
      {canAct(['almoxarifado'], ['de_acordo']) && (
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <FileUpload
            label="FCT - Termo de Conferência Técnica (opcional)"
            onFileUploaded={(fileName, fileUrl, storagePath) => addAttachment(process.id, 'fct', fileName, fileUrl, storagePath)}
            currentFile={hasFCT ? { fileName: process.attachments.find(a => a.type === 'fct')!.fileName, fileUrl: process.attachments.find(a => a.type === 'fct')!.fileUrl } : null}
            onFileRemoved={() => {
              const fct = process.attachments.find(a => a.type === 'fct');
              if (fct) {
                const { removeAttachment } = useProcesses();
                removeAttachment(process.id, fct.id);
              }
            }}
          />
        </div>
      )}

      {/* Termo de Incorporação - at patrimônio */}
      {canAct(['patrimonio'], ['patrimonio']) && !process.patrimonioConfirmed && (
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <FileUpload
            label="Termo de Incorporação (opcional)"
            onFileUploaded={(fileName, fileUrl, storagePath) => addAttachment(process.id, 'termo_incorporacao', fileName, fileUrl, storagePath)}
            currentFile={hasTermo ? { fileName: process.attachments.find(a => a.type === 'termo_incorporacao')!.fileName, fileUrl: process.attachments.find(a => a.type === 'termo_incorporacao')!.fileUrl } : null}
            onFileRemoved={() => {
              const termo = process.attachments.find(a => a.type === 'termo_incorporacao');
              if (termo) {
                const { removeAttachment } = useProcesses();
                removeAttachment(process.id, termo.id);
              }
            }}
          />
        </div>
      )}

      {/* Action section */}
      <div className="space-y-2">
        <Label>Observações da Ação</Label>
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

        {canAct(['almoxarifado'], ['pendencia_fornecedor']) && process.isIT && (
          <Button onClick={() => doAction('reenviar_nti')} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reenviar ao NTI para Nova Conferência
          </Button>
        )}

        {canAct(['almoxarifado'], ['pendencia_fornecedor']) && !process.isIT && (
          <Button onClick={() => doAction('reconferencia_almox')} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Iniciar Nova Conferência
          </Button>
        )}

        {canAct(['almoxarifado'], ['de_acordo']) && (
          <Button onClick={() => doAction('encaminhar_patrimonio')} className="gap-2">
            <Stamp className="w-4 h-4" /> Encaminhar ao Patrimônio
          </Button>
        )}

        {/* Patrimônio: first confirm, then deliver */}
        {canAct(['patrimonio'], ['patrimonio']) && !process.patrimonioConfirmed && (
          <Button onClick={() => doAction('confirmar_patrimonio')} className="gap-2">
            <ShieldCheck className="w-4 h-4" /> Confirmar Colagem do Patrimônio
          </Button>
        )}

        {canAct(['patrimonio'], ['patrimonio']) && process.patrimonioConfirmed && (
          <Button onClick={() => doAction('entregar')} className="gap-2 bg-status-success hover:bg-status-success/90">
            <Truck className="w-4 h-4" /> Registrar Entrega Final
          </Button>
        )}
      </div>
    </div>
  );
}
