import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Process, ProcessStatus, TimelineEntry } from '@/types/process';
import { useAuth } from './AuthContext';

interface ProcessContextType {
  processes: Process[];
  addProcess: (data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => void;
  advanceProcess: (processId: string, action: string, notes?: string, agreement?: 'de_acordo' | 'em_desacordo') => void;
  updateProcess: (processId: string, data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => void;
  deleteProcess: (processId: string) => void;
  getProcess: (id: string) => Process | undefined;
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

  const addProcess = (data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => {
    if (!user) return;
    const now = new Date().toISOString();
    const id = String(Date.now());
    const newProcess: Process = {
      id,
      ...data,
      currentStatus: 'aguardando_recebimento',
      createdBy: user.id,
      createdByName: user.name,
      createdAt: now,
      updatedAt: now,
      timeline: [{
        id: `t-${id}`,
        processId: id,
        status: 'aguardando_recebimento',
        sector: 'Planejamento',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: 'Registro de compra realizada',
      }],
    };
    setProcesses(prev => [newProcess, ...prev]);
  };

  const updateProcess = (processId: string, data: { processNumber: string; itemName: string; quantity: number; destination: string; isIT: boolean }) => {
    if (!user) return;
    setProcesses(prev => prev.map(p => {
      if (p.id !== processId) return p;
      const now = new Date().toISOString();
      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: p.currentStatus,
        sector: 'Administração',
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes: `Processo editado pelo administrador ${user.name}`,
      };
      return {
        ...p,
        ...data,
        updatedAt: now,
        timeline: [...p.timeline, entry],
      };
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

      switch (action) {
        case 'receber':
          newStatus = 'recebido_almoxarifado';
          sector = 'Almoxarifado';
          break;
        case 'enviar_nti':
          newStatus = 'conferencia_nti';
          sector = 'NTI';
          break;
        case 'conferencia_almox':
          newStatus = 'conferencia_almoxarifado';
          sector = 'Almoxarifado';
          break;
        case 'parecer':
          if (agreement === 'de_acordo') {
            newStatus = 'de_acordo';
          } else {
            newStatus = 'em_desacordo';
          }
          sector = p.isIT ? 'NTI' : 'Almoxarifado';
          break;
        case 'pendencia_fornecedor':
          newStatus = 'pendencia_fornecedor';
          sector = 'Almoxarifado';
          break;
        case 'reenviar_nti':
          newStatus = 'conferencia_nti';
          sector = 'Almoxarifado';
          break;
        case 'reconferencia_almox':
          newStatus = 'conferencia_almoxarifado';
          sector = 'Almoxarifado';
          break;
        case 'patrimonio':
          newStatus = 'patrimonio';
          sector = 'Patrimônio';
          break;
        case 'entregar':
          newStatus = 'entregue';
          sector = 'Patrimônio';
          break;
      }

      const entry: TimelineEntry = {
        id: `t-${Date.now()}`,
        processId,
        status: newStatus,
        sector,
        userId: user.id,
        userName: user.name,
        timestamp: now,
        notes,
        agreement,
      };

      return {
        ...p,
        currentStatus: newStatus,
        updatedAt: now,
        timeline: [...p.timeline, entry],
      };
    }));
  };

  const getProcess = (id: string) => processes.find(p => p.id === id);

  return (
    <ProcessContext.Provider value={{ processes, addProcess, advanceProcess, updateProcess, deleteProcess, getProcess }}>
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcesses() {
  const context = useContext(ProcessContext);
  if (!context) throw new Error('useProcesses must be used within ProcessProvider');
  return context;
}
