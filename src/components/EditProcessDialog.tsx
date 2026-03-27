import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Process } from '@/types/process';
import { useProcesses } from '@/contexts/ProcessContext';
import { useToast } from '@/hooks/use-toast';

interface EditProcessDialogProps {
  process: Process;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProcessDialog({ process, open, onOpenChange }: EditProcessDialogProps) {
  const [processNumber, setProcessNumber] = useState(process.processNumber);
  const [itemName, setItemName] = useState(process.itemName);
  const [quantity, setQuantity] = useState(String(process.quantity));
  const [destination, setDestination] = useState(process.destination);
  const [isIT, setIsIT] = useState(process.isIT);
  const { updateProcess } = useProcesses();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processNumber || !itemName || !quantity || !destination) return;
    updateProcess(process.id, {
      processNumber,
      itemName,
      quantity: parseInt(quantity),
      destination,
      isIT,
    });
    toast({ title: 'Processo atualizado', description: 'Dados alterados com sucesso.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Processo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-processNumber">Número do Processo</Label>
            <Input id="edit-processNumber" value={processNumber} onChange={e => setProcessNumber(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-itemName">Nome do Item</Label>
            <Input id="edit-itemName" value={itemName} onChange={e => setItemName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Quantidade</Label>
            <Input id="edit-quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-destination">Destino</Label>
            <Input id="edit-destination" value={destination} onChange={e => setDestination(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-isIT">Item de TI?</Label>
            <Switch id="edit-isIT" checked={isIT} onCheckedChange={setIsIT} />
          </div>
          <Button type="submit" className="w-full">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
