import { useState, useCallback } from "react";
import { Upload, Film, CheckCircle2, Link, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onYouTubeSubmit: (url: string) => void;
}

const UploadZone = ({ onFileSelect, onYouTubeSubmit }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"file" | "youtube">("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeSubmitted, setYoutubeSubmitted] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("video/")) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
    ];
    return patterns.some((pattern) => pattern.test(url));
  };

  const handleYouTubeSubmit = () => {
    if (isValidYouTubeUrl(youtubeUrl)) {
      setYoutubeSubmitted(true);
      onYouTubeSubmit(youtubeUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-border/50 p-1 bg-secondary/30">
        <button
          onClick={() => {
            setMode("file");
            setYoutubeSubmitted(false);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
            mode === "file"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => {
            setMode("youtube");
            setSelectedFile(null);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
            mode === "youtube"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Youtube className="w-4 h-4" />
          YouTube URL
        </button>
      </div>

      {mode === "file" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer group",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border/50 hover:border-primary/50 hover:bg-secondary/30",
            selectedFile && "border-dominant/50 bg-dominant/5"
          )}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center gap-4 text-center">
            {selectedFile ? (
              <>
                <div className="p-4 rounded-full bg-dominant/20">
                  <CheckCircle2 className="w-10 h-10 text-dominant" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "p-4 rounded-full transition-colors",
                    isDragging ? "bg-primary/20" : "bg-secondary group-hover:bg-primary/10"
                  )}
                >
                  {isDragging ? (
                    <Film className="w-10 h-10 text-primary" />
                  ) : (
                    <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {isDragging ? "Drop your video here" : "Upload match video"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to browse • MP4, MOV supported
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-xl border-2 border-dashed p-12 transition-all duration-300",
            youtubeSubmitted
              ? "border-dominant/50 bg-dominant/5"
              : "border-border/50"
          )}
        >
          <div className="flex flex-col items-center gap-6 text-center">
            {youtubeSubmitted ? (
              <>
                <div className="p-4 rounded-full bg-dominant/20">
                  <CheckCircle2 className="w-10 h-10 text-dominant" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    YouTube video queued
                  </p>
                  <p className="text-sm text-muted-foreground break-all max-w-md">
                    {youtubeUrl}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-secondary">
                  <Youtube className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Paste YouTube URL
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enter a YouTube video link for analysis
                  </p>
                </div>
                <div className="w-full max-w-md space-y-3">
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="text-center"
                  />
                  <Button
                    onClick={handleYouTubeSubmit}
                    disabled={!isValidYouTubeUrl(youtubeUrl)}
                    className="w-full gap-2"
                  >
                    <Link className="w-4 h-4" />
                    Submit Video
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
