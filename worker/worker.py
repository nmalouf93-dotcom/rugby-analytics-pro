#!/usr/bin/env python3
"""
Rugby Analytics Worker - Railway Deployment
Polls Supabase for queued analysis jobs, processes videos, uploads results.
"""

import os
import sys
import time
import json
import traceback
from datetime import datetime, timezone
from pathlib import Path

from supabase import create_client, Client

# Environment variables (Railway sets these)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
VIDEOS_BUCKET = os.environ.get("VIDEOS_BUCKET", "videos")
RESULTS_BUCKET = os.environ.get("RESULTS_BUCKET", "results")
POLL_SECONDS = int(os.environ.get("POLL_SECONDS", "5"))

# Validate required env vars
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    sys.exit(1)

# Initialize Supabase client with service role (bypasses RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def claim_job() -> dict | None:
    """
    Atomically claim the oldest queued job.
    Uses status transition to prevent double-processing.
    Returns the job dict or None if no jobs available.
    """
    # Find oldest queued job
    result = supabase.table("analysis_jobs") \
        .select("*") \
        .eq("status", "queued") \
        .order("created_at", desc=False) \
        .limit(1) \
        .execute()
    
    if not result.data:
        return None
    
    job = result.data[0]
    job_id = job["id"]
    
    # Attempt to claim by setting status to processing
    # Only succeeds if still queued (atomic check)
    update_result = supabase.table("analysis_jobs") \
        .update({
            "status": "processing",
            "started_at": datetime.now(timezone.utc).isoformat()
        }) \
        .eq("id", job_id) \
        .eq("status", "queued") \
        .execute()
    
    if not update_result.data:
        # Another worker claimed it
        print(f"[{job_id}] Job already claimed by another worker")
        return None
    
    print(f"[{job_id}] Claimed job: {job['video_filename']}")
    return update_result.data[0]


def download_video(job: dict, work_dir: Path) -> Path:
    """
    Download video from Supabase Storage or YouTube.
    Returns path to local video file.
    """
    video_path = job["video_path"]
    job_id = job["id"]
    
    # Check if YouTube URL
    if video_path.startswith("http://") or video_path.startswith("https://"):
        print(f"[{job_id}] Downloading from YouTube: {video_path}")
        import yt_dlp
        
        output_path = work_dir / f"{job_id}.mp4"
        ydl_opts = {
            "format": "best[ext=mp4]/best",
            "outtmpl": str(output_path),
            "quiet": True,
            "no_warnings": True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_path])
        
        return output_path
    
    # Download from Supabase Storage
    print(f"[{job_id}] Downloading from Storage: {video_path}")
    response = supabase.storage.from_(VIDEOS_BUCKET).download(video_path)
    
    ext = Path(video_path).suffix or ".mp4"
    local_path = work_dir / f"{job_id}{ext}"
    local_path.write_bytes(response)
    
    return local_path


def run_analysis(video_path: Path, output_dir: Path) -> dict:
    """
    Run rugby_mvp.py analysis on the video.
    Returns summary dict.
    """
    # Import the analysis module
    sys.path.insert(0, str(Path(__file__).parent))
    from rugby_mvp import analyze_video
    
    return analyze_video(str(video_path), str(output_dir))


def upload_results(job: dict, output_dir: Path) -> str:
    """
    Upload results to Supabase Storage.
    Returns the results path prefix.
    """
    job_id = job["id"]
    user_id = job["user_id"]
    results_prefix = f"{user_id}/{job_id}"
    
    # Upload each result file
    for file_path in output_dir.iterdir():
        if file_path.is_file():
            storage_path = f"{results_prefix}/{file_path.name}"
            print(f"[{job_id}] Uploading: {storage_path}")
            
            with open(file_path, "rb") as f:
                supabase.storage.from_(RESULTS_BUCKET).upload(
                    storage_path,
                    f.read(),
                    file_options={"upsert": "true"}
                )
    
    return results_prefix


def mark_done(job_id: str, results_path: str, summary: dict):
    """Mark job as successfully completed."""
    supabase.table("analysis_jobs").update({
        "status": "done",
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "results_path": results_path,
        "summary": summary,
        "error": None
    }).eq("id", job_id).execute()
    
    print(f"[{job_id}] Completed successfully")


def mark_failed(job_id: str, error_message: str):
    """Mark job as failed with error message."""
    supabase.table("analysis_jobs").update({
        "status": "failed",
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "error": error_message[:1000]  # Truncate long errors
    }).eq("id", job_id).execute()
    
    print(f"[{job_id}] Failed: {error_message}")


def process_job(job: dict):
    """Process a single analysis job."""
    job_id = job["id"]
    work_dir = Path(f"/tmp/rugby_worker/{job_id}")
    output_dir = work_dir / "output"
    
    try:
        # Create working directories
        work_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Download video
        video_path = download_video(job, work_dir)
        print(f"[{job_id}] Video downloaded: {video_path}")
        
        # Run analysis
        print(f"[{job_id}] Running analysis...")
        summary = run_analysis(video_path, output_dir)
        print(f"[{job_id}] Analysis complete")
        
        # Upload results
        results_path = upload_results(job, output_dir)
        
        # Mark done
        mark_done(job_id, results_path, summary)
        
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        print(f"[{job_id}] Error: {error_msg}")
        mark_failed(job_id, error_msg)
    
    finally:
        # Cleanup
        import shutil
        if work_dir.exists():
            shutil.rmtree(work_dir, ignore_errors=True)


def main():
    """Main polling loop."""
    print("=" * 60)
    print("Rugby Analytics Worker Starting")
    print(f"  Supabase URL: {SUPABASE_URL}")
    print(f"  Videos bucket: {VIDEOS_BUCKET}")
    print(f"  Results bucket: {RESULTS_BUCKET}")
    print(f"  Poll interval: {POLL_SECONDS}s")
    print("=" * 60)
    
    while True:
        try:
            job = claim_job()
            
            if job:
                process_job(job)
            else:
                time.sleep(POLL_SECONDS)
                
        except KeyboardInterrupt:
            print("\nShutting down...")
            break
        except Exception as e:
            print(f"Worker error: {e}")
            traceback.print_exc()
            time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
