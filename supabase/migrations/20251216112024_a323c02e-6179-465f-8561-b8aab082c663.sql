-- Storage policies for videos bucket (users upload only to their folder)
CREATE POLICY "Users can upload videos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users cannot read videos (worker uses service role)
CREATE POLICY "Users cannot read videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos' 
  AND false
);

-- Storage policies for results bucket (users read only from their folder)
CREATE POLICY "Users can read results from own folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'results' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users cannot upload to results (worker uses service role)
CREATE POLICY "Users cannot upload results"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'results' 
  AND false
);

-- Add indexes for job polling performance
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON public.analysis_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);