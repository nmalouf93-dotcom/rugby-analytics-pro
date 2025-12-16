import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle2, Loader2, XCircle, Film, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnalysisJob } from "@/hooks/useAnalysisJobs";

interface AnalysisListProps {
  jobs: AnalysisJob[];
  onSelect: (job: AnalysisJob) => void;
  selectedJobId?: string;
}

const statusConfig: Record<string, {
  icon: typeof Clock;
  label: string;
  className: string;
  iconClassName?: string;
}> = {
  queued: {
    icon: Clock,
    label: "Queued",
    className: "bg-muted text-muted-foreground border-border",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    className: "bg-info/20 text-info border-info/30",
    iconClassName: "animate-spin",
  },
  done: {
    icon: CheckCircle2,
    label: "Complete",
    className: "bg-dominant/20 text-dominant border-dominant/30",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-lost/20 text-lost border-lost/30",
  },
};

const AnalysisList = ({ jobs, onSelect, selectedJobId }: AnalysisListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No Analyses Yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload a match video to get started
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold">My Analyses</h3>
        <p className="text-sm text-muted-foreground">{jobs.length} total</p>
      </div>
      <div className="divide-y divide-border/30">
        {jobs.map((job) => {
          const status = statusConfig[job.status];
          const StatusIcon = status.icon;

          return (
            <button
              key={job.id}
              onClick={() => onSelect(job)}
              className={cn(
                "w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left",
                selectedJobId === job.id && "bg-secondary/50"
              )}
            >
              <div className="p-2 rounded-lg bg-secondary/50">
                <Film className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.video_filename}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
              <Badge variant="outline" className={cn("shrink-0", status.className)}>
                <StatusIcon className={cn("w-3 h-3 mr-1", status.iconClassName)} />
                {status.label}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisList;
