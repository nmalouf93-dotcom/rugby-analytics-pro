# Rugby Analytics Worker

Background worker for processing rugby video analysis jobs. Deploys to Railway.

## Architecture

```
User uploads video → Supabase Storage (videos bucket)
                   → Creates job row (status: queued)
                   
Worker polls       → Claims job (status: processing)
                   → Downloads video
                   → Runs rugby_mvp.py
                   → Uploads results (results bucket)
                   → Updates job (status: done/failed)
                   
Frontend polls     → Shows status
                   → Fetches results via signed URLs
```

## Railway Deployment

### 1. Push to GitHub

```bash
cd worker
git init
git add .
git commit -m "Initial worker"
git remote add origin https://github.com/YOUR_USER/rugby-worker.git
git push -u origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `rugby-worker` repository
4. Railway auto-detects Python and installs dependencies

### 3. Set Environment Variables

In Railway dashboard → Variables:

```
SUPABASE_URL=https://mnkcnibybpkmcffzcpsz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
VIDEOS_BUCKET=videos
RESULTS_BUCKET=results
POLL_SECONDS=5
```

**⚠️ Get your Service Role Key from Lovable Cloud settings. Never expose this client-side.**

### 4. Set Start Command

In Railway dashboard → Settings → Deploy:

```
Start Command: python worker.py
```

### 5. Deploy

Railway auto-deploys on push. Check logs to verify polling.

## Local Development

```bash
# Create venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install deps
pip install -r requirements.txt

# Set env vars
export SUPABASE_URL="https://mnkcnibybpkmcffzcpsz.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key-here"

# Run
python worker.py
```

## Files

- `worker.py` - Main polling loop and job processing
- `rugby_mvp.py` - Video analysis (replace placeholder with real implementation)
- `requirements.txt` - Python dependencies

## Security Notes

- **Service Role Key**: Only used server-side in this worker. Never in frontend.
- **Storage Policies**: Users can only upload to `videos/{user_id}/`, read from `results/{user_id}/`
- **RLS**: Users can only see/modify their own jobs
