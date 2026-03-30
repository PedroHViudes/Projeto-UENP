import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Process, ProcessStatus, TimelineEntry, ProcessAttachment, AttachmentType } from '@/types/process';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProcessContextType {
  processes: Process[];
  addProcess: (data: {
    processNumber: string; itemName: string; quantity: number;
    destination: string; isIT: boolean;
    attachment: { fileName: string; fileUrl: string; storagePath: string };
  }) => void;
  advanceProcess: (processId: string, action: string, notes?: string, agreement?: 'de_acordo' | 'em_desacordo') => void;
  addObservation: (processId: string, notes: string) => void;
  updateProcess: (processId: string, data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => void;
  deleteProcess: (processId: string) => void;
  getProcess: (id: string) => Process | undefined;
  addAttachment: (processId: string, type: AttachmentType, fileName: string, fileUrl: string, storagePath: string) => void;
  removeAttachment: (processId: string, attachmentId: string) => void;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

const MOCK_PROCESSES: Process[] = [
  {
    id: '1',
    processNumber: 'PROC-2024-001',
    itemName: 'Notebook Dell Latitude 5540',
    quantity: 10,
    destination: 'Departamento de TI',
    currentStatus: 'conferencia_nti',
    isIT: true,
    createdBy: '1',
    createdByName: 'Ana Silva',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-05T14:30:00Z',
    attachments: [],
    patrimonioConfirmed: false,
    timeline: [
      { id: 't1', processId: '1', status: 'aguardando_recebimento', sector: 'Planejamento', userId: '1', userName: 'Ana Silva', timestamp: '2024-03-01T10:00:00Z', notes: 'Compra realizada via pregão eletrônico' },
      { id: 't2', processId: '1', status: 'recebido_almoxarifado', sector: 'Almoxarifado', userId: '2', userName: 'Carlos Souza', timestamp: '2024-03-04T09:15:00Z', notes: 'Recebido 10 unidades. NF 45231' },
      { id: 't3', processId: '1', status: 'conferencia_nti', sector: 'NTI', userId: '3', userName: 'Diego Martins', timestamp: '2024-03-05T14:30:00Z', notes: 'Em análise técnica' },
    ],
  },
  {
    id: '2',
    processNumber: 'PROC-2024-002',
    itemName: 'Cadeira Ergonômica Escritório',
    quantity: 25,
    destination: 'Setor Administrativo',
    currentStatus: 'aguardando_recebimento',
    isIT: false,
    createdBy: '1',
    createdByName: 'Ana Silva',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z',
    attachments: [],
    patrimonioConfirmed: false,
    timeline: [
      { id: 't4', processId: '2', status: 'aguardando_recebimento', sector: 'Planejamento', userId: '1', userName: 'Ana Silva', timestamp: '2024-03-10T11:00:00Z', notes: 'Compra de mobiliário' },
    ],
  },
  {
    id: '3',
    processNumber: 'PROC-2024-003',
    itemName: 'Monitor LG 27"',
    quantity: 15,
    destination: 'Laboratório de Informática',
    currentStatus: 'pendencia_fornecedor',
    isIT: true,
    createdBy: '1',
    createdByName: 'Ana Silva',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-03-08T16:00:00Z',
    attachments: [],
    patrimonioConfirmed: false,
    timeline: [
      { id: 't5', processId: '3', status: 'aguardando_recebimento', sector: 'Planejamento', userId: '1', userName: 'Ana Silva', timestamp: '2024-02-20T08:00:00Z' },
      { id: 't6', processId: '3', status: 'recebido_almoxarifado', sector: 'Almoxarifado', userId: '2', userName: 'Carlos Souza', timestamp: '2024-02-25T10:00:00Z' },
      { id: 't7', processId: '3', status: 'conferencia_nti', sector: 'NTI', userId: '3', userName: 'Diego Martins', timestamp: '2024-03-01T11:00:00Z' },
      { id: 't8', processId: '3', status: 'em_desacordo', sector: 'NTI', userId: '3', userName: 'Diego Martins', timestamp: '2024-03-05T15:00:00Z', notes: '3 unidades com tela danificada', agreement: 'em_desacordo' },
      { id: 't9', processId: '3', status: 'pendencia_fornecedor', sector: 'Almoxarifado', userId: '2', userName: 'Carlos Souza', timestamp: '2024-03-08T16:00:00Z', notes: 'Aguardando troca pelo fornecedor' },
    ],
  },
  {
    id: '4',
    processNumber: 'PROC-2024-004',
    itemName: 'Impressora HP LaserJet',
    quantity: 5,
    destination: 'Secretaria Geral',
    currentStatus: 'entregue',
    isIT: true,
    createdBy: '1',
    createdByName: 'Ana Silva',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-02-28T10:00:00Z',
    attachments: [],
    patrimonioConfirmed: true,
    timeline: [
      { id: 't10', processId: '4', status: 'aguardando_recebimento', sector: 'Planejamento', userId: '1', userName: 'Ana Silva', timestamp: '2024-01-15T09:00:00Z' },
      { id: 't11', processId: '4', status: 'recebido_almoxarifado', sector: 'Almoxarifado', userId: '2', userName: 'Carlos Souza', timestamp: '2024-01-25T10:00:00Z' },
      { id: 't12', processId: '4', status: 'conferencia_nti', sector: 'NTI', userId: '3', userName: 'Diego Martins', timestamp: '2024-02-01T14:00:00Z' },
      { id: 't13', processId: '4', status: 'de_acordo', sector: 'NTI', userId: '3', userName: 'Diego Martins', timestamp: '2024-02-10T11:00:00Z', agreement: 'de_acordo' },
      { id: 't14', processId: '4', status: 'patrimonio', sector: 'Patrimônio', userId: '4', userName: 'Fernanda Lima', timestamp: '2024-02-15T09:00:00Z', notes: 'Tombamento patrimonial realizado' },
      { id: 't15', processId: '4', status: 'entregue', sector: 'Patrimônio', userId: '4', userName: 'Fernanda Lima', timestamp: '2024-02-28T10:00:00Z', notes: 'Entregue ao setor requisitante' },
    ],
  },
];

export function ProcessProvider({ children }: { children: ReactNode }) {
  const [processes, setProcesses] = useState<Process[]>(MOCK_PROCESSES);
  const { user } = useAuth();

  const addProcess = (data: {
    processNumber: string; itemName: string; quantity: number;
    destination: string; isIT: boolean;
    attachment: { fileName: string; fileUrl: string; storagePath: string };
  }) => {
    if (!user) return;
    const now = new Date().toISOString();
    const id = String(Date.now());
    const attachmentId = `att-${id}`;

    const newProcess: Process = {
      id,
      processNumber: data.processNumber,
      itemName: data.itemName,
      quantity: data.quantity,
      destination: data.destination,
      isIT: data.isIT,
      currentStatus: 'aguardando_recebimento',
      createdBy: user.id,
      createdByName: user.name,
      createdAt: now,
      updatedAt: now,
      patrimonioConfirmed: false,
      attachments: [{
        id: attachmentId,
        type: 'processo',
        fileName: data.attachment.fileName,
        fileUrl: data.attachment.fileUrl,
        storagePath: data.attachment.storagePath,
        uploadedBy: user.id,
        uploadedByName: user.name,
        uploadedAt: now,
      }],
      timeline: [{
        id: `t-${id}`,
        processId: id,
        status: 'aguardando_recebimento',
        sector: 'Planejamento',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: 'Registro de compra realizada',
        attachmentFileName: data.attachment.fileName,
        attachmentUrl: data.attachment.fileUrl,
      }],
    };
    setProcesses(prev => [newProcess, ...prev]);
  };

  const updateProcess = (processId: string, data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => {
    if (!user) return;
    setProcesses(prev => prev.map(p => {
      if (p.id !== processId) return p;
      const now = new Date().toISOString();
      const changes: string[] = [];
      if (p.processNumber !== data.processNumber) changes.push(`Número: ${p.processNumber} → ${data.processNumber}`);
      if (p.itemName !== data.itemName) changes.push(`Item: ${p.itemName} → ${data.itemName}`);
      if (p.quantity !== data.quantity) changes.push(`Quantidade: ${p.quantity} → ${data.quantity}`);
      if (p.destination !== data.destination) changes.push(`Destino: ${p.destination} → ${data.destination}`);
      if (p.isIT !== data.isIT) changes.push(`Tipo: ${p.isIT ? 'TI' : 'Geral'} → ${data.isIT ? 'TI' : 'Geral'}`);

      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: p.currentStatus,
        sector: user.role === 'admin' ? 'Administração' : 'Planejamento',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: changes.length > 0
          ? `Processo editado por ${user.name}. Alterações: ${changes.join('; ')}`
          : `Processo editado por ${user.name} (sem alterações nos dados)`,
      };
      return { ...p, ...data, updatedAt: now, timeline: [...p.timeline, entry] };
    }));
  };

  const deleteProcess = (processId: string) => {
    setProcesses(prev => prev.filter(p => p.id !== processId));
  };

  const advanceProcess = (processId: string, action: string, notes?: string, agreement?: 'de_acordo' | 'em_desacordo') => {
    if (!user) return;
    setProcesses(prev => prev.map(p => {
      if (p.id !== processId) return p;
      const now = new Date().toISOString();
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

      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: action === 'confirmar_patrimonio' ? p.currentStatus : newStatus,
        sector,
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: action === 'confirmar_patrimonio' ? (notes || 'Colagem de patrimônio confirmada') : notes,
        agreement,
      };

      return {
        ...p,
        currentStatus: action === 'confirmar_patrimonio' ? p.currentStatus : newStatus,
        patrimonioConfirmed: newPatrimonioConfirmed,
        updatedAt: now,
        timeline: [...p.timeline, entry],
      };
    }));
  };

  const addObservation = (processId: string, notes: string) => {
    if (!user) return;
    setProcesses(prev => prev.map(p => {
      if (p.id !== processId) return p;
      const now = new Date().toISOString();
      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: p.currentStatus,
        sector: user.role === 'nti' ? 'NTI' : user.role === 'patrimonio' ? 'Patrimônio' : user.role === 'planejamento' ? 'Planejamento' : 'Almoxarifado',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes,
      };
      return { ...p, updatedAt: now, timeline: [...p.timeline, entry] };
    }));
  };

  const addAttachment = (processId: string, type: AttachmentType, fileName: string, fileUrl: string, storagePath: string) => {
    if (!user) return;
    setProcesses(prev => prev.map(p => {
      if (p.id !== processId) return p;
      const now = new Date().toISOString();
      const existing = p.attachments.find(a => a.type === type);
      const noteText = existing
        ? `Arquivo substituído (${type}): ${existing.fileName} → ${fileName}`
        : `Arquivo anexado (${type}): ${fileName}`;

      const newAttachments = existing
        ? p.attachments.map(a => a.type === type ? {
            ...a, id: `att-${Date.now()}`, fileName, fileUrl, storagePath,
            uploadedBy: user.id, uploadedByName: user.name, uploadedAt: now,
          } : a)
        : [...p.attachments, {
            id: `att-${Date.now()}`, type, fileName, fileUrl, storagePath,
            uploadedBy: user.id, uploadedByName: user.name, uploadedAt: now,
          }];

      // Delete old file from storage
      if (existing) {
        supabase.storage.from('process-documents').remove([existing.storagePath]);
      }

      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: p.currentStatus,
        sector: user.role === 'nti' ? 'NTI' : user.role === 'patrimonio' ? 'Patrimônio' : user.role === 'planejamento' ? 'Planejamento' : 'Almoxarifado',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: noteText,
        attachmentFileName: fileName,
        attachmentUrl: fileUrl,
      };

      return { ...p, attachments: newAttachments, updatedAt: now, timeline: [...p.timeline, entry] };
    }));
  };

  const removeAttachment = (processId: string, attachmentId: string) => {
    if (!user) return;
    setProcesses(prev => prev.map(p => {
      if (p.id !== processId) return p;
      const attachment = p.attachments.find(a => a.id === attachmentId);
      if (!attachment) return p;
      if (attachment.uploadedBy !== user.id && user.role !== 'admin') return p;

      const now = new Date().toISOString();
      supabase.storage.from('process-documents').remove([attachment.storagePath]);

      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: p.currentStatus,
        sector: user.role === 'nti' ? 'NTI' : user.role === 'patrimonio' ? 'Patrimônio' : user.role === 'planejamento' ? 'Planejamento' : 'Almoxarifado',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: `Arquivo removido (${attachment.type}): ${attachment.fileName}`,
      };

      return {
        ...p,
        attachments: p.attachments.filter(a => a.id !== attachmentId),
        updatedAt: now,
        timeline: [...p.timeline, entry],
      };
    }));
  };

  const getProcess = (id: string) => processes.find(p => p.id === id);

  return (
    <ProcessContext.Provider value={{
      processes, addProcess, advanceProcess, addObservation,
      updateProcess, deleteProcess, getProcess, addAttachment, removeAttachment,
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
