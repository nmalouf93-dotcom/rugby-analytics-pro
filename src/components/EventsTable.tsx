import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TackleEvent {
  id: number;
  startTime: string;
  duration: string;
  bodies: number;
  displacement: string;
  quality: "dominant" | "neutral" | "lost";
  confidence: number;
}

interface RuckEvent {
  id: number;
  startTime: string;
  duration: string;
  bodies: number;
  confidence: number;
}

interface EventsTableProps {
  type: "tackles" | "rucks";
  tackles?: TackleEvent[];
  rucks?: RuckEvent[];
}

const qualityVariants = {
  dominant: "bg-dominant/20 text-dominant border-dominant/30",
  neutral: "bg-warning/20 text-warning border-warning/30",
  lost: "bg-lost/20 text-lost border-lost/30",
};

const EventsTable = ({ type, tackles, rucks }: EventsTableProps) => {
  if (type === "tackles" && tackles) {
    return (
      <div className="glass rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-lg font-semibold">Tackle Events</h3>
          <p className="text-sm text-muted-foreground">
            {tackles.length} tackles detected
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Duration</TableHead>
                <TableHead className="text-muted-foreground">Bodies</TableHead>
                <TableHead className="text-muted-foreground">Displacement</TableHead>
                <TableHead className="text-muted-foreground">Quality</TableHead>
                <TableHead className="text-muted-foreground">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tackles.map((tackle) => (
                <TableRow
                  key={tackle.id}
                  className="border-border/30 hover:bg-secondary/30"
                >
                  <TableCell className="font-mono text-sm">#{tackle.id}</TableCell>
                  <TableCell>{tackle.startTime}</TableCell>
                  <TableCell>{tackle.duration}</TableCell>
                  <TableCell>{tackle.bodies}</TableCell>
                  <TableCell>{tackle.displacement}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        qualityVariants[tackle.quality]
                      )}
                    >
                      {tackle.quality}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${tackle.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(tackle.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (type === "rucks" && rucks) {
    return (
      <div className="glass rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-lg font-semibold">Ruck Events</h3>
          <p className="text-sm text-muted-foreground">
            {rucks.length} rucks detected
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Duration</TableHead>
                <TableHead className="text-muted-foreground">Bodies</TableHead>
                <TableHead className="text-muted-foreground">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rucks.map((ruck) => (
                <TableRow
                  key={ruck.id}
                  className="border-border/30 hover:bg-secondary/30"
                >
                  <TableCell className="font-mono text-sm">#{ruck.id}</TableCell>
                  <TableCell>{ruck.startTime}</TableCell>
                  <TableCell>{ruck.duration}</TableCell>
                  <TableCell>{ruck.bodies}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${ruck.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(ruck.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return null;
};

export default EventsTable;
