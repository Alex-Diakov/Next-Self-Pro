import React, { useCallback, useState } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';

interface UploadViewProps {
  onUpload: (file: File) => void;
}

export function UploadView({ onUpload }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const validateAndUpload = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setError("For this prototype, please keep files under 20MB. Consider using a compressed audio file instead.");
      return;
    }
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setError("Please upload a valid video or audio file.");
      return;
    }
    onUpload(file);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-primary mb-4 tracking-tight">Upload Session</h2>
        <p className="text-muted text-lg font-medium max-w-xl mx-auto">Upload a video or audio recording of your therapy session for AI transcription and analysis.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative group flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[40px] transition-all duration-500 bg-surface-hover backdrop-blur-xl cursor-pointer overflow-hidden border-t-white/5",
            isDragging 
              ? "border-accent bg-accent/10 shadow-2xl shadow-accent/20" 
              : "border-border hover:border-accent/50 hover:bg-surface-highlight hover:shadow-2xl shadow-accent/10"
          )}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <input
            type="file"
            accept="video/*,audio/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <div className="flex flex-col items-center justify-center p-6 text-center z-0 pointer-events-none relative">
            <div className={cn(
              "w-24 h-24 mb-6 rounded-full flex items-center justify-center transition-all duration-500 border shadow-inner",
              isDragging ? "bg-accent/20 text-accent-hover border-accent/50 scale-110" : "bg-surface-highlight text-muted border-border-hover group-hover:bg-accent/10 group-hover:text-accent-hover group-hover:border-accent/30 group-hover:scale-105"
            )}>
              <Icon name="cloud_upload" filled className="text-5xl" />
            </div>
            <p className="text-2xl font-bold text-primary mb-2 tracking-tight">
              Drag & drop your session file here
            </p>
            <p className="text-sm text-subtle mb-8 font-medium">
              Supports MP4, WebM, MP3, WAV (Max 20MB for prototype)
            </p>
            <button className="px-10 py-3.5 bg-premium-gradient border-t border-white/20 rounded-xl text-sm font-bold text-background shadow-xl hover:scale-105 transition-all duration-300 pointer-events-none glow-accent">
              Browse Files
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3 text-error-muted shadow-lg shadow-error/15 backdrop-blur-md"
          >
            <Icon name="error" filled className="text-xl shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-surface-hover backdrop-blur-xl rounded-[32px] border border-border border-t-white/10 shadow-2xl flex items-start gap-6 hover:border-border-hover transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-info/20 to-transparent"></div>
            <div className="w-16 h-16 rounded-2xl bg-info/10 text-info-muted border border-info/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Icon name="video_file" filled className="text-3xl" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-2 text-xl tracking-tight">Video Sessions</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">Upload video recordings to analyze both verbal communication and visual cues.</p>
            </div>
          </div>
          <div className="p-8 bg-surface-hover backdrop-blur-xl rounded-[32px] border border-border border-t-white/10 shadow-2xl flex items-start gap-6 hover:border-border-hover transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-info/20 to-transparent"></div>
            <div className="w-16 h-16 rounded-2xl bg-info/10 text-info-muted border border-info/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Icon name="audio_file" filled className="text-3xl" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-2 text-xl tracking-tight">Audio Sessions</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">Upload audio-only recordings for fast, accurate transcription and clinical insights.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
