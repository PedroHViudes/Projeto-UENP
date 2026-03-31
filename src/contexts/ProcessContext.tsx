import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Process, ProcessStatus, TimelineEntry, ProcessAttachment, AttachmentType } from '@/types/process';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProcessContextType {
  processes: Process[];
  loading: boolean;
  addProcess: (data: {
    processNumber: string; itemName: string; quantity: number;
    destination: string; isIT: boolean;
    attachment: { fileName: string; fileUrl: string; storagePath: string };
  }) => Promise<void>;
  advanceProcess: (processId: string, action: string, notes?: string, agreement?: 'de_acordo' | 'em_desacordo') => Promise<void>;
  addObservation: (processId: string, notes: string) => Promise<void>;
  updateProcess: (processId: string, data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => Promise<void>;
  deleteProcess: (processId: string) => Promise<void>;
  getProcess: (id: string) => Process | undefined;
  addAttachment: (processId: string, type: AttachmentType, fileName: string, fileUrl: string, storagePath: string) => Promise<void>;
  removeAttachment: (processId: string, attachmentId: string) => Promise<void>;
  refreshProcesses: () => Promise<void>;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

function mapDbProcess(p: any, timelines: any[], attachments: any[]): Process {
  return {
    id: p.id,
    processNumber: p.process_number,
    itemName: p.item_name,
    quantity: p.quantity,
    destination: p.destination,
    currentStatus: p.current_status as ProcessStatus,
    isIT: p.is_it,
    createdBy: p.created_by,
    createdByName: p.created_by_name,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    patrimonioConfirmed: p.patrimonio_confirmed,
    timeline: timelines
      .filter(t => t.process_id === p.id)
      .map(t => ({
        id: t.id,
        processId: t.process_id,
        status: t.status as ProcessStatus,
        sector: t.sector,
        userId: t.user_id,
        userName: t.user_name,
        timestamp: t.created_at,
        notes: t.notes || undefined,
        agreement: t.agreement as any,
        attachmentFileName: t.attachment_file_name || undefined,
        attachmentUrl: t.attachment_url || undefined,
      })),
    attachments: attachments
      .filter(a => a.process_id === p.id)
      .map(a => ({
        id: a.id,
        type: a.type as AttachmentType,
        fileName: a.file_name,
        fileUrl: a.file_url,
        storagePath: a.storage_path,
        uploadedBy: a.uploaded_by,
        uploadedByName: a.uploaded_by_name,
        uploadedAt: a.uploaded_at,
      })),
  };
}

export function ProcessProvider({ children }: { children: ReactNode }) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProcesses = useCallback(async () => {
    const { data: procs } = await supabase
      .from('processes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!procs || procs.length === 0) {
      setProcesses([]);
      setLoading(false);
      return;
    }

    const ids = procs.map(p => p.id);

    const [{ data: timelines }, { data: attachments }] = await Promise.all([
      supabase.from('timeline_entries').select('*').in('process_id', ids).order('created_at'),
      supabase.from('process_attachments').select('*').in('process_id', ids).order('uploaded_at'),
    ]);

    setProcesses(procs.map(p => mapDbProcess(p, timelines || [], attachments || [])));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchProcesses();
    } else {
      setProcesses([]);
      setLoading(false);
    }
  }, [user, fetchProcesses]);

  const getSectorName = () => {
    if (!user) return '';
    const map: Record<string, string> = {
      nti: 'NTI', patrimonio: 'Patrimônio',
      planejamento: 'Planejamento', almoxarifado: 'Almoxarifado', admin: 'Administração',
    };
    return map[user.role] || user.role;
  };

  const sendNotification = async (data: {
    processNumber: string; itemName: string; quantity: number;
    destination: string; currentStatus: string; action: string;
    userName: string; sector: string; notes?: string; agreement?: string;
  }) => {
    try {
      await supabase.functions.invoke('send-process-notification', { body: data });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

 const addProcess = async (data: {
    processNumber: string; itemName: string; quantity: number;
    destination: string; isIT: boolean;
    attachment?: { fileName: string; fileUrl: string; storagePath: string } | null; // Tornamos opcional aqui também
  }) => {
    if (!user) return;

    // 1. Inserir o processo principal
    const { data: proc, error } = await supabase
      .from('processes')
      .insert({
        process_number: data.processNumber,
        item_name: data.itemName,
        quantity: data.quantity,
        destination: data.destination,
        is_it: data.isIT,
        created_by: user.id,
        created_by_name: user.name,
      })
      .select()
      .single();

    if (error || !proc) {
      console.error("Erro ao criar processo:", error);
      return;
    }

    // 2. Criar as entradas de timeline e anexos apenas se houver anexo
    await supabase.from('timeline_entries').insert({
      process_id: proc.id,
      status: 'aguardando_recebimento' as const,
      sector: 'Planejamento',
      user_id: user.id,
      user_name: user.name,
      notes: 'Registro de compra realizada',
      attachment_file_name: data.attachment?.fileName || null,
      attachment_url: data.attachment?.fileUrl || null,
    });

    if (data.attachment) {
      await supabase.from('process_attachments').insert({
        process_id: proc.id,
        type: 'processo' as const,
        file_name: data.attachment.fileName,
        file_url: data.attachment.fileUrl,
        storage_path: data.attachment.storagePath,
        uploaded_by: user.id,
        uploaded_by_name: user.name,
      });
    }

    await fetchProcesses();
  };
  const updateProcess = async (processId: string, data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => {
    if (!user) return;
    const p = processes.find(p => p.id === processId);
    if (!p) return;

    const changes: string[] = [];
    if (p.processNumber !== data.processNumber) changes.push(`Número: ${p.processNumber} → ${data.processNumber}`);
    if (p.itemName !== data.itemName) changes.push(`Item: ${p.itemName} → ${data.itemName}`);
    if (p.quantity !== data.quantity) changes.push(`Quantidade: ${p.quantity} → ${data.quantity}`);
    if (p.destination !== data.destination) changes.push(`Destino: ${p.destination} → ${data.destination}`);
    if (p.isIT !== data.isIT) changes.push(`Tipo: ${p.isIT ? 'TI' : 'Geral'} → ${data.isIT ? 'TI' : 'Geral'}`);

    await supabase
      .from('processes')
      .update({
        process_number: data.processNumber,
        item_name: data.itemName,
        quantity: data.quantity,
        destination: data.destination,
        is_it: data.isIT,
        updated_at: new Date().toISOString(),
      })
      .eq('id', processId);

    await supabase.from('timeline_entries').insert({
      process_id: processId,
      status: p.currentStatus,
      sector: getSectorName(),
      user_id: user.id,
      user_name: user.name,
      notes: changes.length > 0
        ? `Processo editado por ${user.name}. Alterações: ${changes.join('; ')}`
        : `Processo editado por ${user.name} (sem alterações nos dados)`,
    });

    await fetchProcesses();
  };

  const deleteProcess = async (processId: string) => {
    await supabase.from('processes').delete().eq('id', processId);
    await fetchProcesses();
  };

  const advanceProcess = async (processId: string, action: string, notes?: string, agreement?: 'de_acordo' | 'em_desacordo') => {
    if (!user) return;
    const p = processes.find(p => p.id === processId);
    if (!p) return;

    let newStatus: ProcessStatus = p.currentStatus;
    let sector = '';
    let newPatrimonioConfirmed = p.patrimonioConfirmed;

    switch (action) {
      case 'receber':
        newStatus = 'recebido_almoxarifado'; sector = 'Almoxarifado'; break;
      case 'enviar_nti':
        newStatus = 'conferencia_nti'; sector = 'NTI'; break;
      case 'conferencia_almox':
        newStatus = 'conferencia_almoxarifado'; sector = 'Almoxarifado'; break;
      case 'parecer':
        newStatus = agreement === 'de_acordo' ? 'de_acordo' : 'em_desacordo';
        sector = p.isIT ? 'NTI' : 'Almoxarifado'; break;
      case 'pendencia_fornecedor':
        newStatus = 'pendencia_fornecedor'; sector = 'Almoxarifado'; break;
      case 'reenviar_nti':
        newStatus = 'conferencia_nti'; sector = 'Almoxarifado'; break;
      case 'reconferencia_almox':
        newStatus = 'conferencia_almoxarifado'; sector = 'Almoxarifado'; break;
      case 'encaminhar_patrimonio':
        newStatus = 'patrimonio'; sector = 'Almoxarifado'; break;
      case 'confirmar_patrimonio':
        newPatrimonioConfirmed = true; sector = 'Patrimônio'; break;
      case 'entregar':
        newStatus = 'entregue'; sector = 'Patrimônio'; break;
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (action !== 'confirmar_patrimonio') {
      updateData.current_status = newStatus;
    }
    if (newPatrimonioConfirmed !== p.patrimonioConfirmed) {
      updateData.patrimonio_confirmed = newPatrimonioConfirmed;
    }

    await supabase.from('processes').update(updateData).eq('id', processId);

    await supabase.from('timeline_entries').insert({
      process_id: processId,
      status: action === 'confirmar_patrimonio' ? p.currentStatus : newStatus,
      sector,
      user_id: user.id,
      user_name: user.name,
      notes: action === 'confirmar_patrimonio' ? (notes || 'Colagem de patrimônio confirmada') : notes,
      agreement: agreement || null,
    });

    await fetchProcesses();
  };

  const addObservation = async (processId: string, notes: string) => {
    if (!user) return;
    const p = processes.find(p => p.id === processId);
    if (!p) return;

    await supabase.from('timeline_entries').insert({
      process_id: processId,
      status: p.currentStatus,
      sector: getSectorName(),
      user_id: user.id,
      user_name: user.name,
      notes,
    });

    await fetchProcesses();
  };

  const addAttachment = async (processId: string, type: AttachmentType, fileName: string, fileUrl: string, storagePath: string) => {
    if (!user) return;
    const p = processes.find(p => p.id === processId);
    if (!p) return;

    const existing = p.attachments.find(a => a.type === type);
    const noteText = existing
      ? `Arquivo substituído (${type}): ${existing.fileName} → ${fileName}`
      : `Arquivo anexado (${type}): ${fileName}`;

    if (existing) {
      // Delete old from storage and DB
      await supabase.storage.from('process-documents').remove([existing.storagePath]);
      await supabase.from('process_attachments').delete().eq('id', existing.id);
    }

    await supabase.from('process_attachments').insert({
      process_id: processId,
      type,
      file_name: fileName,
      file_url: fileUrl,
      storage_path: storagePath,
      uploaded_by: user.id,
      uploaded_by_name: user.name,
    });

    await supabase.from('timeline_entries').insert({
      process_id: processId,
      status: p.currentStatus,
      sector: getSectorName(),
      user_id: user.id,
      user_name: user.name,
      notes: noteText,
      attachment_file_name: fileName,
      attachment_url: fileUrl,
    });

    await fetchProcesses();
  };

  const removeAttachment = async (processId: string, attachmentId: string) => {
    if (!user) return;
    const p = processes.find(p => p.id === processId);
    if (!p) return;
    const attachment = p.attachments.find(a => a.id === attachmentId);
    if (!attachment) return;
    if (attachment.uploadedBy !== user.id && user.role !== 'admin') return;

    await supabase.storage.from('process-documents').remove([attachment.storagePath]);
    await supabase.from('process_attachments').delete().eq('id', attachmentId);

    await supabase.from('timeline_entries').insert({
      process_id: processId,
      status: p.currentStatus,
      sector: getSectorName(),
      user_id: user.id,
      user_name: user.name,
      notes: `Arquivo removido (${attachment.type}): ${attachment.fileName}`,
    });

    await fetchProcesses();
  };

  const getProcess = (id: string) => processes.find(p => p.id === id);

  return (
    <ProcessContext.Provider value={{
      processes, loading, addProcess, advanceProcess, addObservation,
      updateProcess, deleteProcess, getProcess, addAttachment, removeAttachment, refreshProcesses: fetchProcesses,
    }}>
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcesses() {
  const context = useContext(ProcessContext);
  if (!context) throw new Error('useProcesses must be used within ProcessProvider');
  return context;
}
