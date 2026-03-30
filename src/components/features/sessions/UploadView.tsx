import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, AlertCircle, FileAudio } from 'lucide-react';
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

    const file = e.dataTransfer.files[0];
    validateAndUpload(file);
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
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Upload Session</h2>
        <p className="text-slate-500 text-lg">Upload a video or audio recording of your therapy session for AI transcription and analysis.</p>
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
            "relative group flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl transition-all duration-300 bg-white cursor-pointer overflow-hidden",
            isDragging 
              ? "border-primary-500 bg-primary-50 shadow-lg shadow-primary-100" 
              : "border-slate-200 hover:border-primary-400 hover:bg-slate-50 hover:shadow-md"
          )}
        >
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <div className="flex flex-col items-center justify-center p-6 text-center z-0 pointer-events-none">
            <div className={cn(
              "w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-colors duration-300",
              isDragging ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500"
            )}>
              <UploadCloud className="w-10 h-10" />
            </div>
            <p className="text-xl font-semibold text-slate-700 mb-2">
              Drag & drop your session file here
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Supports MP4, WebM, MP3, WAV (Max 20MB for prototype)
            </p>
            <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm group-hover:border-primary-200 group-hover:text-primary-700 transition-colors pointer-events-none">
              Browse Files
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileVideo className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Video Sessions</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Upload video recordings to analyze both verbal communication and visual cues.</p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileAudio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Audio Sessions</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Upload audio-only recordings for fast, accurate transcription and clinical insights.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
