import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, LogOut, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisJobs, AnalysisJob } from "@/hooks/useAnalysisJobs";
import UploadZone from "@/components/UploadZone";
import AnalysisList from "@/components/AnalysisList";
import AnalysisDetail from "@/components/AnalysisDetail";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { jobs, loading: jobsLoading, uploadVideo, createJob } = useAnalysisJobs();
  const [selectedJob, setSelectedJob] = useState<AnalysisJob | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    
    const videoPath = await uploadVideo(file);
    if (videoPath) {
      const job = await createJob(videoPath, file.name);
      if (job) {
        setSelectedJob(job);
        setShowUpload(false);
      }
    }
    
    setIsUploading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Rugby Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 shrink-0 space-y-4">
            <Button
              onClick={() => {
                setShowUpload(true);
                setSelectedJob(null);
              }}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>

            {jobsLoading ? (
              <div className="glass rounded-lg p-8 text-center">
                <div className="animate-pulse text-muted-foreground">
                  Loading analyses...
                </div>
              </div>
            ) : (
              <AnalysisList
                jobs={jobs}
                onSelect={(job) => {
                  setSelectedJob(job);
                  setShowUpload(false);
                }}
                selectedJobId={selectedJob?.id}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {showUpload ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Upload Match Video</h2>
                  <p className="text-muted-foreground">
                    Upload your match footage to begin analysis
                  </p>
                </div>

                <UploadZone onFileSelect={handleFileSelect} />

                {isUploading && (
                  <div className="glass rounded-lg p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Uploading video and creating job...
                    </p>
                  </div>
                )}

                <div className="glass rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Python Worker Setup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    After uploading, run your Python worker to process the video:
                  </p>
                  <pre className="bg-background/50 rounded-lg p-4 text-sm overflow-x-auto">
                    <code>{`# worker.py example
import supabase
from rugby_mvp import RugbyMVP

# Poll for queued jobs
# Download video from storage
# Run analysis
# Upload results back to storage
# Update job status to 'done'`}</code>
                  </pre>
                </div>
              </div>
            ) : selectedJob ? (
              <AnalysisDetail job={selectedJob} />
            ) : (
              <div className="glass rounded-lg p-12 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h2 className="text-xl font-semibold mb-2">Select an Analysis</h2>
                <p className="text-muted-foreground mb-6">
                  Choose an existing analysis from the list or upload a new video
                </p>
                <Button
                  onClick={() => setShowUpload(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Analysis
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
