import React, { useDeferredValue, useMemo, useEffect, useRef } from 'react';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';
import { TranscriptionState } from '../../../../types';
import { useSessionStore } from '../../../../store/useSessionStore';

interface TranscriptPanelProps {
  transcriptionState: TranscriptionState;
  isProcessing: boolean;
  isEditingTranscript: boolean;
  editedTranscript: string;
  setEditedTranscript: (text: string) => void;
}

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const TranscriptPanel = React.memo(function TranscriptPanel({
  transcriptionState,
  isProcessing,
  isEditingTranscript,
  editedTranscript,
  setEditedTranscript,
}: TranscriptPanelProps) {
  
  const { transcriptLines, currentTime, seekTo, resetTranscription } = useSessionStore();
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeLineIndex = useMemo(() => {
    if (!transcriptLines.length) return -1;
    let activeIdx = -1;
    for (let i = 0; i < transcriptLines.length; i++) {
      const lineSeconds = parseTimeToSeconds(transcriptLines[i].timestamp);
      if (lineSeconds <= currentTime) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [transcriptLines, currentTime]);

  useEffect(() => {
    if (activeLineIndex >= 0 && lineRefs.current[activeLineIndex]) {
      lineRefs.current[activeLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-subtle space-y-8 max-w-sm mx-auto text-center p-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-border/60 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-accent rounded-full border-t-transparent animate-spin absolute inset-0 shadow-lg shadow-accent/30"></div>
        </div>
        <div>
          <h4 className="text-xl font-bold text-primary mb-2 tracking-tight">Processing Session</h4>
          <p className="text-sm text-muted font-mono bg-background/50 px-4 py-2 rounded-lg border border-border/50 mb-4">{transcriptionState.message}</p>
          <button 
            onClick={() => resetTranscription()}
            className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-accent-hover transition-colors"
          >
            Reset & Retry
          </button>
        </div>
        
        <div className="w-full space-y-4 mt-6 text-left bg-background/30 p-6 rounded-3xl border border-border">
          {[
            { id: 'uploading', label: 'Uploading securely' },
            { id: 'extracting_audio', label: 'Extracting audio track' },
            { id: 'processing_ai', label: 'AI transcription & diarization' }
          ].map((step) => {
            const steps = ['idle', 'uploading', 'extracting_audio', 'processing_ai', 'completed'];
            const currentStepIndex = steps.indexOf(transcriptionState.step);
            const stepIndex = steps.indexOf(step.id);
            
            const isPast = currentStepIndex > stepIndex;
            const isCurrent = currentStepIndex === stepIndex;
            
            return (
              <div key={step.id} className="flex items-center gap-4 text-sm font-mono text-xs">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
                  isPast ? "bg-success/10 border-success/30 text-success-muted" :
                  isCurrent ? "border-accent/50 text-accent-hover bg-accent/10 shadow-sm shadow-accent/20" :
                  "border-border text-subtle bg-surface/50"
                )}>
                  {isPast ? <Icon name="check_circle" filled className="text-xs" /> : <div className={cn("w-2 h-2 rounded-full", isCurrent ? "bg-accent shadow-sm shadow-accent/80" : "bg-transparent")} />}
                </div>
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  isPast ? "text-muted" :
                  isCurrent ? "text-accent-hover" :
                  "text-subtle"
                )}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (transcriptionState.step === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-error p-8 text-center bg-error/5 rounded-premium border border-error/20 m-8">
        <Icon name="error" filled className="text-6xl mb-6 text-error-muted drop-shadow-md drop-shadow-error/30" />
        <h4 className="text-2xl font-bold text-error-muted mb-3 tracking-tight">Transcription Failed</h4>
        <p className="text-sm text-error-muted/80 font-mono bg-background/50 px-4 py-2 rounded-lg border border-error-bg/50">{transcriptionState.error}</p>
      </div>
    );
  }

  if (isEditingTranscript) {
    return (
      <div className="absolute inset-0 p-8 lg:p-10">
        <textarea
          value={editedTranscript}
          onChange={(e) => setEditedTranscript(e.target.value)}
          className="w-full h-full min-h-[300px] p-6 bg-background/50 border border-border/60 rounded-premium focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 resize-none font-mono text-sm leading-relaxed text-secondary custom-scrollbar shadow-inner"
          placeholder="Edit transcript here..."
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto p-5 lg:p-6 custom-scrollbar">
      <div className="flex flex-col gap-2 pb-10">
        {transcriptLines.map((line, index) => {
          const nextLine = transcriptLines[index + 1];
          const lineSeconds = parseTimeToSeconds(line.timestamp);
          const nextLineSeconds = nextLine ? parseTimeToSeconds(nextLine.timestamp) : Infinity;
          
          const isActive = currentTime >= lineSeconds && currentTime < nextLineSeconds;
          const isTherapist = line.speaker.toLowerCase().includes('психолог') || line.speaker.toLowerCase().includes('терапевт');
          
          return (
            <div 
              key={line.id} 
              ref={(el) => { lineRefs.current[index] = el; }}
              onClick={() => seekTo(lineSeconds)}
              className={cn(
                "group flex flex-col gap-1 p-3 border-l-2 transition-colors duration-300 cursor-pointer",
                isActive 
                  ? "bg-white/5 border-accent text-white" 
                  : "border-transparent text-secondary/70 hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-bold tracking-wider uppercase",
                  isTherapist ? "text-accent" : "text-subtle"
                )}>
                  {line.speaker}
                </span>
                <span className="text-[10px] font-mono text-subtle opacity-50 group-hover:opacity-100 transition-opacity">
                  {line.timestamp}
                </span>
              </div>
              <div className={cn(
                "text-sm leading-relaxed transition-colors",
                isActive ? "text-white font-medium" : "text-secondary/80"
              )}>
                {line.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
