import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  required?: boolean;
  onFileUploaded: (fileName: string, fileUrl: string, storagePath: string) => void;
  accept?: string;
  currentFile?: { fileName: string; fileUrl: string } | null;
  onFileRemoved?: () => void;
}

export function FileUpload({ label, required, onFileUploaded, accept = '.pdf', currentFile, onFileRemoved }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(
    currentFile ? { name: currentFile.fileName, url: currentFile.fileUrl } : null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Erro', description: 'Apenas arquivos PDF são aceitos.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const path = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('process-documents')
      .upload(path, file);

    if (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('process-documents')
      .getPublicUrl(path);

    setSelectedFile({ name: file.name, url: urlData.publicUrl });
    onFileUploaded(file.name, urlData.publicUrl, path);
    setUploading(false);

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileRemoved?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {selectedFile ? (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline truncate flex-1">
            {selectedFile.name}
          </a>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleRemove}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div>
          <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Enviando...' : 'Selecionar PDF'}
          </Button>
        </div>
      )}
    </div>
  );
}
