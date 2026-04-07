import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { SessionRecord } from '../../../services/db.service';
import { TranscriptionState } from '../../../types';

interface MediaPanelProps {
  onBack: () => void;
  videoUrl: string | null;
  isVideo: boolean;
  isProcessing: boolean;
  transcriptionState: TranscriptionState;
  session: SessionRecord | null;
  file: File | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function MediaPanel({
  onBack,
  videoUrl,
  isVideo,
  isProcessing,
  transcriptionState,
  session,
  file,
  videoRef,
  audioRef
}: MediaPanelProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  return (
    <div className="w-full lg:w-4/12 flex flex-col gap-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-muted hover:text-accent-hover transition-colors w-fit bg-surface-hover px-5 py-2.5 rounded-xl border border-border border-t-border-glass backdrop-blur-md hover:border-accent/30 shadow-lg"
      >
        <Icon name="arrow_back" className="text-lg" />
        Back to Workspace
      </button>
      
      <div className="bg-background rounded-[32px] overflow-hidden shadow-premium aspect-video relative flex items-center justify-center border border-border border-t-border-glass group">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {isProcessing && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[32px]">
            <div className="w-full h-full bg-accent/5 animate-scanline border-b border-accent/20 shadow-md shadow-accent/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
          </div>
        )}
        {videoUrl ? (
          isVideo ? (
            <video 
              ref={videoRef}
              src={videoUrl} 
              controls 
              className="w-full h-full object-contain bg-black/50 rounded-[inherit]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-subtle rounded-[inherit]">
              <Icon name="play_circle" className="text-6xl mb-4 opacity-30" />
              <audio ref={audioRef} src={videoUrl} controls className="w-3/4" />
            </div>
          )
        ) : (transcriptionState.step === 'completed' || transcriptionState.step === 'idle') && !file ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-subtle rounded-[inherit] p-8 text-center border border-dashed border-border/50">
            <Icon name="video_file" className="text-5xl mb-4 opacity-30" />
            <span className="text-sm font-medium">No media file found for this session</span>
            <p className="text-xs opacity-60 mt-2">The original file may have been moved or deleted from your local storage.</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-subtle rounded-[inherit]">
            <Icon name="sync" className="text-4xl animate-spin mb-4 text-accent" />
            <span className="text-sm font-mono">Loading media...</span>
          </div>
        )}
      </div>

      <div className="card-premium relative overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-hover/30 transition-colors focus-ring"
        >
          <div className="flex items-center gap-2 text-secondary font-bold">
            <Icon name="info" filled className="text-lg text-accent-hover" />
            Session Details
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "font-bold flex items-center gap-1.5 text-[10px] uppercase px-2 py-1 rounded-xl border tracking-wide",
              transcriptionState.step === 'completed' ? "bg-success/10 text-success-muted border-success/20" :
              transcriptionState.step === 'error' ? "bg-error/10 text-error-muted border-error/20" :
              "bg-accent/10 text-accent-hover border-accent/20"
            )}>
              {transcriptionState.step === 'completed' && <Icon name="check_circle" filled className="text-xs" />}
              {transcriptionState.step === 'error' && <Icon name="error" filled className="text-xs" />}
              {isProcessing && <Icon name="sync" className="text-xs animate-spin" />}
              {transcriptionState.step === 'completed' ? 'Ready' : isProcessing ? 'Processing' : 'Error'}
            </span>
            <Icon name={isDetailsExpanded ? "expand_less" : "expand_more"} className="text-lg text-subtle" />
          </div>
        </button>

        <AnimatePresence>
          {isDetailsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4 text-sm border-t border-border/30 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-subtle font-medium">File Name</span>
                  <span className="font-bold text-secondary truncate max-w-[180px] font-mono text-xs bg-background/50 px-2 py-1 rounded-md border border-border/50">{session?.fileName || file?.name || 'Loading...'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-subtle font-medium">File Size</span>
                  <span className="font-bold text-secondary font-mono text-xs bg-background/50 px-2 py-1 rounded-md border border-border/50">
                    {session?.fileSize ? (session.fileSize / (1024 * 1024)).toFixed(2) : file ? (file.size / (1024 * 1024)).toFixed(2) : '0'} MB
                  </span>
                </div>
                
                {isProcessing && (
                  <div className="pt-3 border-t border-border/30">
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="text-subtle font-medium">Progress</span>
                      <span className="text-accent-hover font-mono">{transcriptionState.message}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5 overflow-hidden border border-border/50 shadow-inner">
                      <motion.div 
                        className="bg-accent h-full rounded-full shadow-sm shadow-accent/80"
                        initial={{ width: 0 }}
                        animate={{ width: `${transcriptionState.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
