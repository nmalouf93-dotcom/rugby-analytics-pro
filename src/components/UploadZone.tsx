import { useState, useCallback } from "react";
import { Upload, Film, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

const UploadZone = ({ onFileSelect }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  return (
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
  );
};

export default UploadZone;
