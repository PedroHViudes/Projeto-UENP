import { TimelineEntry, STATUS_LABELS, STATUS_COLORS } from '@/types/process';
import { CheckCircle2, XCircle, Clock, ArrowRight, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProcessTimelineProps {
  entries: TimelineEntry[];
}

const iconColorMap = {
  success: 'text-status-success bg-status-success/10',
  danger: 'text-status-danger bg-status-danger/10',
  warning: 'text-status-warning bg-status-warning/10',
  info: 'text-status-info bg-status-info/10',
};

const lineColorMap = {
  success: 'bg-status-success',
  danger: 'bg-status-danger',
  warning: 'bg-status-warning',
  info: 'bg-status-info',
};

export function ProcessTimeline({ entries }: ProcessTimelineProps) {
  return (
    <div className="relative">
      {entries.map((entry, index) => {
        const color = STATUS_COLORS[entry.status];
        const isLast = index === entries.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <div className={cn(
                'absolute left-5 top-10 w-0.5 h-[calc(100%-2rem)]',
                lineColorMap[color]
              )} style={{ opacity: 0.3 }} />
            )}

            <div className={cn(
              'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0',
              iconColorMap[color]
            )}>
              {entry.agreement === 'de_acordo' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : entry.agreement === 'em_desacordo' ? (
                <XCircle className="w-5 h-5" />
              ) : entry.status === 'entregue' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground">
                  {STATUS_LABELS[entry.status]}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-medium text-primary">{entry.sector}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{entry.userName}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{format(new Date(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>

              {entry.notes && (
                <p className="mt-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                  {entry.notes}
                </p>
              )}

              {entry.attachmentFileName && entry.attachmentUrl && (
                <a
                  href={entry.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary underline hover:text-primary/80"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {entry.attachmentFileName}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
