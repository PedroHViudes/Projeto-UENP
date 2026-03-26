import { ProcessStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/process';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProcessStatus;
  className?: string;
}

const colorMap = {
  success: 'status-badge-success',
  danger: 'status-badge-danger',
  warning: 'status-badge-warning',
  info: 'status-badge-info',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      colorMap[STATUS_COLORS[status]],
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}
