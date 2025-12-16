import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Film, 
  Download,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "./StatsCard";
import TackleQualityChart from "./TackleQualityChart";
import RuckDurationChart from "./RuckDurationChart";
import EventsTable from "./EventsTable";
import { AnalysisJob, useAnalysisJobs } from "@/hooks/useAnalysisJobs";
import { cn } from "@/lib/utils";

interface AnalysisDetailProps {
  job: AnalysisJob;
}

const statusConfig: Record<string, {
  icon: typeof Clock;
  label: string;
  className: string;
  iconClassName?: string;
  description: string;
}> = {
  queued: {
    icon: Clock,
    label: "Queued",
    className: "bg-muted text-muted-foreground",
    description: "Waiting for the Python worker to pick up this job",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    className: "bg-info/20 text-info",
    iconClassName: "animate-spin",
    description: "Video is being analyzed by YOLOv8 + ByteTrack",
  },
  done: {
    icon: CheckCircle2,
    label: "Complete",
    className: "bg-dominant/20 text-dominant",
    description: "Analysis complete! View your results below",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-lost/20 text-lost",
    description: "Something went wrong during processing",
  },
};

const AnalysisDetail = ({ job }: AnalysisDetailProps) => {
  const [summary, setSummary] = useState<any>(null);
  const [tackles, setTackles] = useState<any[]>([]);
  const [rucks, setRucks] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const { getResultsUrl } = useAnalysisJobs();

  useEffect(() => {
    const loadResults = async () => {
      if (job.status !== "done" || !job.results_path) return;

      setLoadingResults(true);
      try {
        // Load summary from DB if available
        if (job.summary) {
          setSummary(job.summary);
        }

        // Fetch CSV files from storage
        const tacklesUrl = await getResultsUrl(`${job.results_path}/tackles.csv`);
        const rucksUrl = await getResultsUrl(`${job.results_path}/rucks.csv`);
        const summaryUrl = await getResultsUrl(`${job.results_path}/summary.json`);

        if (summaryUrl && !job.summary) {
          const res = await fetch(summaryUrl);
          const data = await res.json();
          setSummary(data);
        }

        if (tacklesUrl) {
          const res = await fetch(tacklesUrl);
          const text = await res.text();
          const parsed = parseCSV(text);
          setTackles(parsed);
        }

        if (rucksUrl) {
          const res = await fetch(rucksUrl);
          const text = await res.text();
          const parsed = parseCSV(text);
          setRucks(parsed);
        }
      } catch (err) {
        console.error("Error loading results:", err);
      } finally {
        setLoadingResults(false);
      }
    };

    loadResults();
  }, [job]);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i]?.trim();
      });
      return obj;
    });
  };

  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <Film className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{job.video_filename}</h2>
              <p className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge className={cn("gap-1", status.className)}>
            <StatusIcon className={cn("w-3.5 h-3.5", status.iconClassName)} />
            {status.label}
          </Badge>
        </div>

        <p className="text-muted-foreground">{status.description}</p>

        {job.status === "failed" && job.error && (
          <div className="mt-4 p-4 rounded-lg bg-lost/10 border border-lost/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-lost shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-lost">Error Details</p>
                <p className="text-sm text-muted-foreground mt-1">{job.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{format(new Date(job.created_at), "PPp")}</p>
          </div>
          {job.started_at && (
            <div>
              <p className="text-muted-foreground">Started</p>
              <p className="font-medium">{format(new Date(job.started_at), "PPp")}</p>
            </div>
          )}
          {job.finished_at && (
            <div>
              <p className="text-muted-foreground">Finished</p>
              <p className="font-medium">{format(new Date(job.finished_at), "PPp")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {job.status === "done" && (
        <>
          {loadingResults ? (
            <div className="glass rounded-lg p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          ) : summary ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Tackles"
                  value={summary.tackle_summary?.count || 0}
                  subtitle="Detected events"
                />
                <StatsCard
                  title="Dominant Rate"
                  value={`${(summary.tackle_summary?.pct_dominant || 0).toFixed(1)}%`}
                  variant="dominant"
                />
                <StatsCard
                  title="Total Rucks"
                  value={summary.ruck_summary?.count || 0}
                />
                <StatsCard
                  title="Median Ruck"
                  value={`${(summary.ruck_summary?.median_s || 0).toFixed(1)}s`}
                />
              </div>

              {/* Charts */}
              {summary.tackle_summary && summary.ruck_summary && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <TackleQualityChart
                    data={{
                      dominant: summary.tackle_summary.pct_dominant || 0,
                      neutral: summary.tackle_summary.pct_neutral || 0,
                      lost: summary.tackle_summary.pct_lost || 0,
                    }}
                  />
                  <RuckDurationChart
                    data={{
                      under3s: summary.ruck_summary.pct_under_3s || 0,
                      threeToFive: summary.ruck_summary.pct_3_to_5s || 0,
                      fiveToEight: summary.ruck_summary.pct_5_to_8s || 0,
                      over8s: summary.ruck_summary.pct_over_8s || 0,
                    }}
                  />
                </div>
              )}

              {/* Event Tables */}
              <Tabs defaultValue="tackles" className="space-y-4">
                <TabsList className="bg-secondary/50">
                  <TabsTrigger
                    value="tackles"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Tackles ({tackles.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="rucks"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Rucks ({rucks.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tackles">
                  <EventsTable
                    type="tackles"
                    tackles={tackles.map((t, i) => ({
                      id: i + 1,
                      startTime: `${parseFloat(t.start_time_s || 0).toFixed(1)}s`,
                      duration: `${parseFloat(t.duration_s || 0).toFixed(1)}s`,
                      bodies: parseInt(t.bodies_involved) || 0,
                      displacement: `${parseFloat(t.displacement_m || 0).toFixed(2)}m`,
                      quality: (t.quality || "neutral") as "dominant" | "neutral" | "lost",
                      confidence: parseFloat(t.confidence) || 0,
                    }))}
                  />
                </TabsContent>

                <TabsContent value="rucks">
                  <EventsTable
                    type="rucks"
                    rucks={rucks.map((r, i) => ({
                      id: i + 1,
                      startTime: `${parseFloat(r.start_time_s || 0).toFixed(1)}s`,
                      duration: `${parseFloat(r.duration_s || 0).toFixed(1)}s`,
                      bodies: parseInt(r.bodies_involved) || 0,
                      confidence: parseFloat(r.confidence) || 0,
                    }))}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="glass rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Results are ready but couldn't be loaded. Check if the Python worker uploaded them correctly.
              </p>
            </div>
          )}
        </>
      )}

      {/* Pending states */}
      {(job.status === "queued" || job.status === "processing") && (
        <div className="glass rounded-lg p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">
            {job.status === "queued" ? "Waiting for Worker" : "Analysis in Progress"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {job.status === "queued"
              ? "Your video is queued. Start your Python worker to begin processing."
              : "The video is being analyzed. This may take several minutes depending on video length."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetail;
