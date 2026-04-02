import React from 'react';
import ReactMarkdown from 'react-markdown';
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
}

export function TranscriptPanel({
  transcript,
  transcriptionState,
  isProcessing,
  isEditingTranscript,
  editedTranscript,
  setEditedTranscript,
  handleSeek
}: TranscriptPanelProps) {
  
  const processTranscript = (text: string) => {
    if (!text) return '';
    let processed = text.replace(/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/g, '[$1](#seek-$1)');
    processed = processed.replace(/^(Therapist|Doctor|Interviewer|Speaker 1):\s*/gm, '> **Therapist:** ');
    processed = processed.replace(/^(Client|Patient|Interviewee|Speaker 2):\s*/gm, '> **Client:** ');
    return processed;
  };

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
      <div className="transcript-chat-container space-y-6 pb-10">
        <ReactMarkdown 
          components={{
            a: ({ href, children }) => {
              if (href?.startsWith('#seek-')) {
                const time = href.replace('#seek-', '');
                return (
                  <button 
                    onClick={() => handleSeek(time)}
                    className="inline-flex items-center justify-center px-2 py-0.5 mx-1 bg-accent/20 text-accent-hover hover:bg-accent/30 hover:text-accent-muted rounded text-xs font-mono border border-accent/30 transition-colors focus-ring"
                    title={`Jump to ${time}`}
                  >
                    <Icon name="play_circle" className="text-xs mr-1" />
                    {children}
                  </button>
                );
              }
              return <a href={href}>{children}</a>;
            },
            blockquote: ({ children }) => {
              const text = React.Children.toArray(children).join('');
              const isTherapist = text.includes('Therapist:');
              const isClient = text.includes('Client:');
              
              if (isTherapist || isClient) {
                return (
                  <div className={cn(
                    "flex w-full mb-4",
                    isTherapist ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-xl border-t border-border-glass",
                      isTherapist 
                        ? "bg-accent/10 border border-accent/20 text-secondary rounded-tr-sm glow-accent" 
                        : "bg-surface-highlight border border-border text-secondary rounded-tl-sm"
                    )}>
                      {children}
                    </div>
                  </div>
                );
              }
              return <blockquote className="border-l-4 border-accent/50 bg-accent/5 py-2 px-6 rounded-r-2xl my-4 text-secondary">{children}</blockquote>;
            },
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
          }}
        >
          {processTranscript(transcript)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
