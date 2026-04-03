import React, { useDeferredValue, useMemo, useEffect, useRef } from 'react';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';
import { TranscriptionState } from '../../../../types';

interface TranscriptPanelProps {
  transcript: string;
  transcriptionState: TranscriptionState;
  isProcessing: boolean;
  isEditingTranscript: boolean;
  editedTranscript: string;
  setEditedTranscript: (text: string) => void;
  handleSeek: (time: string) => void;
  currentTime: number;
}

interface TranscriptLine {
  timeString: string;
  seconds: number;
  speaker: string;
  text: string;
  originalLine: string;
}

const parseTime = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

export const TranscriptPanel = React.memo(function TranscriptPanel({
  transcript,
  transcriptionState,
  isProcessing,
  isEditingTranscript,
  editedTranscript,
  setEditedTranscript,
  handleSeek,
  currentTime
}: TranscriptPanelProps) {
  
  const deferredTranscript = useDeferredValue(transcript);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const parsedTranscript = useMemo(() => {
    if (!deferredTranscript) return [];
    
    const lines = deferredTranscript.split('\n');
    const parsedLines: TranscriptLine[] = [];
    
    // Regex to match: [MM:SS] Speaker: Text
    // Or sometimes just MM:SS Speaker: Text
    const lineRegex = /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*?):\s*(.*)$/;
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const match = line.match(lineRegex);
      if (match) {
        parsedLines.push({
          timeString: match[1],
          seconds: parseTime(match[1]),
          speaker: match[2].trim(),
          text: match[3].trim(),
          originalLine: line
        });
      } else {
        // If it doesn't match the format, just add it as a text line without speaker/time
        parsedLines.push({
          timeString: '',
          seconds: 0,
          speaker: '',
          text: line,
          originalLine: line
        });
      }
    }
    
    return parsedLines;
  }, [deferredTranscript]);

  const activeLineIndex = useMemo(() => {
    if (!parsedTranscript.length) return -1;
    let activeIdx = -1;
    for (let i = 0; i < parsedTranscript.length; i++) {
      if (parsedTranscript[i].seconds <= currentTime) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [parsedTranscript, currentTime]);

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
          <p className="text-sm text-muted font-mono bg-background/50 px-4 py-2 rounded-lg border border-border/50">{transcriptionState.message}</p>
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
      <div className="flex flex-col gap-1 pb-10">
        {parsedTranscript.map((line, index) => {
          const isActive = index === activeLineIndex;

          if (!line.speaker) {
            return (
              <div 
                key={index} 
                ref={(el) => (lineRefs.current[index] = el)}
                className={cn(
                  "text-secondary mb-4 p-2 rounded-lg transition-colors",
                  isActive && "bg-accent/10 border border-accent/20"
                )}
              >
                {line.text}
              </div>
            );
          }
          
          const isTherapist = line.speaker.toLowerCase().includes('therapist') || line.speaker.toLowerCase().includes('doctor');
          
          return (
            <div 
              key={index} 
              ref={(el) => (lineRefs.current[index] = el)}
              onClick={() => {
                if (line.timeString) handleSeek(line.timeString);
              }}
              className={cn(
                "group flex flex-col gap-1.5 p-3 -mx-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer",
                isActive && "bg-white/[0.05]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-semibold",
                  isTherapist ? "text-accent" : "text-white"
                )}>
                  {line.speaker}
                </span>
                {line.timeString && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[11px] text-muted-foreground group-hover:bg-accent group-hover:text-white transition-colors">
                    <Icon name="play_circle" className="text-[12px]" />
                    {line.timeString}
                  </span>
                )}
              </div>
              <div className="text-sm text-secondary/90 leading-relaxed tracking-wide">
                {line.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
