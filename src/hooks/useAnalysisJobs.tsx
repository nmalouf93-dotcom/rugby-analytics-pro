import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface AnalysisJob {
  id: string;
  user_id: string;
  video_path: string;
  video_filename: string;
  status: "queued" | "processing" | "done" | "failed";
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  results_path: string | null;
  error: string | null;
  summary: any | null;
}

export const useAnalysisJobs = () => {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchJobs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("analysis_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load analysis jobs",
        variant: "destructive",
      });
    } else {
      setJobs(data as AnalysisJob[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchJobs();

      // Subscribe to realtime updates
      const channel = supabase
        .channel("analysis_jobs_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "analysis_jobs",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setJobs((prev) => [payload.new as AnalysisJob, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setJobs((prev) =>
                prev.map((job) =>
                  job.id === payload.new.id ? (payload.new as AnalysisJob) : job
                )
              );
            } else if (payload.eventType === "DELETE") {
              setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const uploadVideo = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from("videos")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    return filePath;
  };

  const createJob = async (videoPath: string, videoFilename: string): Promise<AnalysisJob | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("analysis_jobs")
      .insert({
        user_id: user.id,
        video_path: videoPath,
        video_filename: videoFilename,
        status: "queued",
      })
      .select()
      .single();

    if (error) {
      console.error("Create job error:", error);
      toast({
        title: "Error",
        description: "Failed to create analysis job",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Job Created",
      description: "Your video has been queued for analysis",
    });

    return data as AnalysisJob;
  };

  const createYouTubeJob = async (youtubeUrl: string): Promise<AnalysisJob | null> => {
    if (!user) return null;

    // Extract video ID for display name
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "youtube-video";
    const displayName = `YouTube: ${videoId}`;

    const { data, error } = await supabase
      .from("analysis_jobs")
      .insert({
        user_id: user.id,
        video_path: youtubeUrl,
        video_filename: displayName,
        status: "queued",
      })
      .select()
      .single();

    if (error) {
      console.error("Create YouTube job error:", error);
      toast({
        title: "Error",
        description: "Failed to create analysis job",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Job Created",
      description: "YouTube video has been queued for analysis",
    });

    return data as AnalysisJob;
  };

  const getResultsUrl = async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("results")
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }

    return data.signedUrl;
  };

  return {
    jobs,
    loading,
    uploadVideo,
    createJob,
    createYouTubeJob,
    getResultsUrl,
    refetch: fetchJobs,
  };
};
