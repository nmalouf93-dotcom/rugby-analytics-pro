import { useState } from "react";
import { 
  Activity, 
  Target, 
  Users, 
  Timer, 
  TrendingUp, 
  Shield,
  Zap,
  BarChart3,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import TackleQualityChart from "@/components/TackleQualityChart";
import RuckDurationChart from "@/components/RuckDurationChart";
import EventsTable from "@/components/EventsTable";
import UploadZone from "@/components/UploadZone";
import FeatureCard from "@/components/FeatureCard";

// Sample data for demonstration
const sampleTackleData = {
  dominant: 42.5,
  neutral: 38.2,
  lost: 19.3,
};

const sampleRuckData = {
  under3s: 45.2,
  threeToFive: 32.1,
  fiveToEight: 15.4,
  over8s: 7.3,
};

const sampleTackles = [
  { id: 1, startTime: "12:34", duration: "1.2s", bodies: 2, displacement: "0.4m", quality: "dominant" as const, confidence: 0.85 },
  { id: 2, startTime: "14:22", duration: "0.9s", bodies: 3, displacement: "1.1m", quality: "neutral" as const, confidence: 0.72 },
  { id: 3, startTime: "18:45", duration: "1.5s", bodies: 4, displacement: "2.3m", quality: "lost" as const, confidence: 0.68 },
  { id: 4, startTime: "23:12", duration: "0.8s", bodies: 2, displacement: "0.2m", quality: "dominant" as const, confidence: 0.91 },
  { id: 5, startTime: "27:38", duration: "1.1s", bodies: 2, displacement: "0.8m", quality: "neutral" as const, confidence: 0.79 },
];

const sampleRucks = [
  { id: 1, startTime: "12:36", duration: "2.4s", bodies: 4, confidence: 0.82 },
  { id: 2, startTime: "14:25", duration: "3.8s", bodies: 5, confidence: 0.75 },
  { id: 3, startTime: "18:48", duration: "5.2s", bodies: 6, confidence: 0.71 },
  { id: 4, startTime: "23:15", duration: "2.1s", bodies: 3, confidence: 0.88 },
  { id: 5, startTime: "27:41", duration: "4.5s", bodies: 5, confidence: 0.77 },
];

const Index = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowDemo(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(160_70%_45%_/_0.1)_0%,_transparent_50%)]" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Rugby Analytics MVP</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gradient">Tackle & Ruck</span>
              <br />
              <span className="text-foreground">Analysis Engine</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Extract actionable insights from match footage. Measure ruck speed, 
              tackle quality, and player commitments using computer vision.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="gap-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-4 h-4" />
                Analyze Video
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 border-border/50 hover:bg-secondary/50"
                onClick={() => setShowDemo(true)}
              >
                <BarChart3 className="w-4 h-4" />
                View Demo Results
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What You Get</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Post-match processing extracts key performance metrics without manual tagging
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Tackle Quality"
            description="Dominant, neutral, or lost classification based on post-contact displacement and bodies involved"
          />
          <FeatureCard
            icon={<Timer className="w-6 h-6" />}
            title="Ruck Speed"
            description="Duration distributions showing how quickly ball is recycled at breakdown"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Ruck Cost"
            description="Bodies committed to each ruck—identify overcommitment patterns"
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Displacement Metrics"
            description="Post-contact movement in meters to assess tackle effectiveness"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Confidence Scores"
            description="Each event includes detection confidence for filtering and verification"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="CSV Export"
            description="Event-level data exported for further analysis in your preferred tools"
          />
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Upload Match Footage</h2>
            <p className="text-muted-foreground">
              Supports broadcast angle (side-on, elevated), 720p–1080p, 25–60fps
            </p>
          </div>
          
          <UploadZone onFileSelect={handleFileSelect} />
          
          <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/30">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Note:</strong> Video processing requires the Python backend. 
              This UI demonstrates the results visualization. Upload triggers demo data display.
            </p>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showDemo && (
        <section className="container mx-auto px-4 py-20 animate-fade-in">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Analysis Results</h2>
            <p className="text-muted-foreground">
              Sample analysis from a 40-minute match segment
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Tackles"
              value="47"
              subtitle="Detected events"
              icon={<Target className="w-6 h-6" />}
            />
            <StatsCard
              title="Dominant Rate"
              value="42.5%"
              subtitle="Quality tackles"
              variant="dominant"
              icon={<Shield className="w-6 h-6" />}
            />
            <StatsCard
              title="Total Rucks"
              value="52"
              subtitle="Breakdown events"
              icon={<Users className="w-6 h-6" />}
            />
            <StatsCard
              title="Median Ruck"
              value="2.8s"
              subtitle="Ball recycled"
              icon={<Timer className="w-6 h-6" />}
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <TackleQualityChart data={sampleTackleData} />
            <RuckDurationChart data={sampleRuckData} />
          </div>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatsCard
              title="Avg Displacement"
              value="0.9m"
              subtitle="Post-contact"
            />
            <StatsCard
              title="P75 Displacement"
              value="1.4m"
            />
            <StatsCard
              title="Avg Bodies/Tackle"
              value="2.4"
            />
            <StatsCard
              title="Rucks <3s"
              value="45.2%"
              variant="dominant"
            />
            <StatsCard
              title="Rucks 5-8s"
              value="15.4%"
              variant="neutral"
            />
            <StatsCard
              title="Overcommit Rate"
              value="18.3%"
              subtitle="≥4 bodies"
              variant="lost"
            />
          </div>

          {/* Events Tables */}
          <Tabs defaultValue="tackles" className="space-y-6">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger 
                value="tackles" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Tackle Events
              </TabsTrigger>
              <TabsTrigger 
                value="rucks"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Ruck Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tackles">
              <EventsTable type="tackles" tackles={sampleTackles} />
            </TabsContent>

            <TabsContent value="rucks">
              <EventsTable type="rucks" rucks={sampleRucks} />
            </TabsContent>
          </Tabs>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-semibold">Rugby Analytics MVP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with YOLOv8 + ByteTrack • Person detection, no player/team IDs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
