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
}

export interface Process {
  id: string;
  processNumber: string;
  itemName: string;
  quantity: number;
  currentStatus: ProcessStatus;
  isIT: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
}

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  aguardando_recebimento: 'Aguardando Recebimento',
  recebido_almoxarifado: 'Recebido no Almoxarifado',
  conferencia_nti: 'Conferência NTI',
  conferencia_almoxarifado: 'Conferência Almoxarifado',
  de_acordo: 'De Acordo',
  em_desacordo: 'Em Desacordo',
  pendencia_fornecedor: 'Pendência com Fornecedor',
  patrimonio: 'Patrimônio',
  entregue: 'Entregue ao Destino Final',
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
