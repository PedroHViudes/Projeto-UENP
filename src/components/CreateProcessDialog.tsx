import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useProcesses } from '@/contexts/ProcessContext';
import { useToast } from '@/hooks/use-toast';

export function CreateProcessDialog() {
  const [open, setOpen] = useState(false);
  const [processNumber, setProcessNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isIT, setIsIT] = useState(false);
  const { addProcess } = useProcesses();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processNumber || !itemName || !quantity) return;
    addProcess({
      processNumber,
      itemName,
      quantity: parseInt(quantity),
      isIT,
    });
    toast({ title: 'Processo criado', description: `${processNumber} registrado com sucesso.` });
    setProcessNumber('');
    setItemName('');
    setQuantity('');
    setIsIT(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Processo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nova Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="processNumber">Número do Processo</Label>
            <Input id="processNumber" placeholder="PROC-2024-005" value={processNumber} onChange={e => setProcessNumber(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemName">Nome do Item</Label>
            <Input id="itemName" placeholder="Ex: Notebook Dell" value={itemName} onChange={e => setItemName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input id="quantity" type="number" min="1" placeholder="10" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isIT">Item de TI?</Label>
            <Switch id="isIT" checked={isIT} onCheckedChange={setIsIT} />
          </div>
          <Button type="submit" className="w-full">Registrar Processo</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
