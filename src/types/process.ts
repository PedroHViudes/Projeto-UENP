export type UserRole = 'planejamento' | 'almoxarifado' | 'nti' | 'patrimonio' | 'admin';

export type ProcessStatus =
  | 'aguardando_recebimento'
  | 'recebido_almoxarifado'
  | 'conferencia_nti'
  | 'conferencia_almoxarifado'
  | 'de_acordo'
  | 'em_desacordo'
  | 'pendencia_fornecedor'
  | 'patrimonio'
  | 'entregue';

export type AttachmentType = 'processo' | 'fct' | 'termo_incorporacao';

export interface ProcessAttachment {
  id: string;
  type: AttachmentType;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface TimelineEntry {
  id: string;
  processId: string;
  status: ProcessStatus;
  sector: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
  agreement?: 'de_acordo' | 'em_desacordo';
  attachmentFileName?: string;
  attachmentUrl?: string;
}

export interface Process {
  id: string;
  processNumber: string;
  itemName: string;
  quantity: number;
  destination: string;
  currentStatus: ProcessStatus;
  isIT: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
  attachments: ProcessAttachment[];
  patrimonioConfirmed: boolean;
}

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  aguardando_recebimento: 'Aguardando Recebimento',
  recebido_almoxarifado: 'Recebido no Almoxarifado',
  conferencia_nti: 'Conferência NTI',
  conferencia_almoxarifado: 'Conferência Almoxarifado',
  de_acordo: 'De Acordo - Aguardando Almoxarifado',
  em_desacordo: 'Em Desacordo',
  pendencia_fornecedor: 'Pendência com Fornecedor',
  patrimonio: 'Patrimônio',
  entregue: 'Entregue ao Destino Final',
};

export const STATUS_SECTOR_MAP: Record<ProcessStatus, string> = {
  aguardando_recebimento: 'Almoxarifado',
  recebido_almoxarifado: 'Almoxarifado',
  conferencia_nti: 'NTI',
  conferencia_almoxarifado: 'Almoxarifado',
  de_acordo: 'Almoxarifado',
  em_desacordo: 'Almoxarifado',
  pendencia_fornecedor: 'Almoxarifado',
  patrimonio: 'Patrimônio',
  entregue: 'Concluído',
};

export const STATUS_COLORS: Record<ProcessStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  aguardando_recebimento: 'warning',
  recebido_almoxarifado: 'info',
  conferencia_nti: 'info',
  conferencia_almoxarifado: 'info',
  de_acordo: 'success',
  em_desacordo: 'danger',
  pendencia_fornecedor: 'danger',
  patrimonio: 'info',
  entregue: 'success',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  planejamento: 'Planejamento',
  almoxarifado: 'Almoxarifado',
  nti: 'NTI',
  patrimonio: 'Patrimônio',
  admin: 'Administrador',
};

export const ATTACHMENT_LABELS: Record<AttachmentType, string> = {
  processo: 'Processo (PDF)',
  fct: 'FCT - Termo de Conferência Técnica',
  termo_incorporacao: 'Termo de Incorporação',
};
