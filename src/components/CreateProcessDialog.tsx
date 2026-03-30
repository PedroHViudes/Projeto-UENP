import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useProcesses } from '@/contexts/ProcessContext';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';

export function CreateProcessDialog() {
  const [open, setOpen] = useState(false);
  const [processNumber, setProcessNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [destination, setDestination] = useState('');
  const [isIT, setIsIT] = useState(false);
  const [attachment, setAttachment] = useState<{ fileName: string; fileUrl: string; storagePath: string } | null>(null);
  const { addProcess } = useProcesses();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processNumber || !itemName || !quantity || !destination) return;
    if (!attachment) {
      toast({ title: 'PDF obrigatório', description: 'Anexe o PDF do processo antes de registrar.', variant: 'destructive' });
      return;
    }
    addProcess({ processNumber, itemName, quantity: parseInt(quantity), destination, isIT, attachment });
    toast({ title: 'Processo criado', description: `${processNumber} registrado com sucesso.` });
    setProcessNumber(''); setItemName(''); setQuantity(''); setDestination(''); setIsIT(false); setAttachment(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Processo</Button>
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
          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <Input id="destination" placeholder="Ex: Departamento de Engenharia" value={destination} onChange={e => setDestination(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isIT">Item de TI?</Label>
            <Switch id="isIT" checked={isIT} onCheckedChange={setIsIT} />
          </div>
          <FileUpload
            label="PDF do Processo"
            required
            onFileUploaded={(fileName, fileUrl, storagePath) => setAttachment({ fileName, fileUrl, storagePath })}
            currentFile={attachment}
            onFileRemoved={() => setAttachment(null)}
          />
          <Button type="submit" className="w-full">Registrar Processo</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
