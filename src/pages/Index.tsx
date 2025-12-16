import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  Target, 
  Users, 
  Timer, 
  TrendingUp, 
  Shield,
  Zap,
  LogIn,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(160_70%_45%_/_0.1)_0%,_transparent_50%)]" />
        
        {/* Nav */}
        <nav className="relative container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Rugby Analytics</span>
          </div>
          {!loading && (
            user ? (
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="outline" className="gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )
          )}
        </nav>
        
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
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
              >
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="w-4 h-4" />
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

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simple 3-step process from video to insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">Upload Video</h3>
            <p className="text-sm text-muted-foreground">
              Upload your match footage through the dashboard
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">Process with Python</h3>
            <p className="text-sm text-muted-foreground">
              Your Python worker analyzes the video using YOLOv8 + ByteTrack
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">View Results</h3>
            <p className="text-sm text-muted-foreground">
              Access charts, stats, and event tables in real-time
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass rounded-2xl p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Analyze?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Create an account and start uploading match footage. Your Python worker 
            handles the heavy lifting.
          </p>
          <Button 
            size="lg" 
            className="gap-2 px-8"
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
          >
            {user ? "Open Dashboard" : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

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
