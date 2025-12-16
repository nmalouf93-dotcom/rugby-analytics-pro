-- Create analysis_jobs table
CREATE TABLE public.analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_path TEXT NOT NULL,
  video_filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  results_path TEXT,
  error TEXT,
  summary JSONB
);

-- Enable RLS
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see their own jobs
CREATE POLICY "Users can view their own jobs"
ON public.analysis_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
ON public.analysis_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
ON public.analysis_jobs FOR UPDATE
USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('results', 'results', false);

-- Storage policies for videos bucket
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for results bucket
CREATE POLICY "Users can view their own results"
ON storage.objects FOR SELECT
USING (bucket_id = 'results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own results"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for analysis_jobs (for status polling)
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_jobs;