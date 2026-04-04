import React from 'react';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';
import { TranscriptPanel } from './TranscriptPanel';
import { AIChatPanel } from './AIChatPanel';
import { EmotionsPanel } from './EmotionsPanel';
import { SpeechPanel } from './SpeechPanel';
import { TranscriptionState } from '../../../../types';
import { ErrorBoundary } from '../../../../components/ui/ErrorBoundary';

interface TranscriptionWidgetProps {
  activeTab: 'transcript' | 'analysis' | 'emotions' | 'speech';
  setActiveTab: (tab: 'transcript' | 'analysis' | 'emotions' | 'speech') => void;
  isProcessing: boolean;
  transcriptionState: TranscriptionState;
  isEditingTranscript: boolean;
  setIsEditingTranscript: (editing: boolean) => void;
  handleStartEdit: () => void;
  handleSaveTranscript: () => void;
  transcript: string;
  editedTranscript: string;
  setEditedTranscript: (text: string) => void;
  messages: any[];
  isAnalyzing: boolean;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
}

export const TranscriptionWidget = React.memo(function TranscriptionWidget({
  activeTab,
  setActiveTab,
  isProcessing,
  transcriptionState,
  isEditingTranscript,
  setIsEditingTranscript,
  handleStartEdit,
  handleSaveTranscript,
  transcript,
  editedTranscript,
  setEditedTranscript,
  messages,
  isAnalyzing,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  messagesEndRef,
  currentTime
}: TranscriptionWidgetProps) {
  return (
    <div className="w-full flex flex-col bg-surface rounded-[2rem] border border-border-glass shadow-premium overflow-hidden flex-1 min-h-[250px] relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none z-0"></div>

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-background/40 relative z-10">
        <div className="flex items-center p-1 bg-black/20 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('transcript')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-md focus-ring",
              activeTab === 'transcript' 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-subtle hover:text-white"
            )}
          >
            <Icon name="description" filled={activeTab === 'transcript'} className="text-[14px]" />
            Transcript
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            disabled={isProcessing || transcriptionState.step === 'error'}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-md focus-ring",
              activeTab === 'analysis' 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-subtle hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Icon name="auto_awesome" filled={activeTab === 'analysis'} className="text-[14px]" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('emotions')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-md focus-ring",
              activeTab === 'emotions' 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-subtle hover:text-white"
            )}
          >
            <Icon name="mood" filled={activeTab === 'emotions'} className="text-[14px]" />
            Emotions
          </button>
          <button
            onClick={() => setActiveTab('speech')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-md focus-ring",
              activeTab === 'speech' 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-subtle hover:text-white"
            )}
          >
            <Icon name="record_voice_over" filled={activeTab === 'speech'} className="text-[14px]" />
            Speech
          </button>
        </div>
        
        {activeTab === 'transcript' && transcriptionState.step === 'completed' && !isEditingTranscript && (
          <button 
            onClick={handleStartEdit}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-subtle hover:text-white hover:bg-white/5 rounded-md transition-colors focus-ring"
          >
            <Icon name="edit" className="text-[14px]" />
            Edit
          </button>
        )}
        {activeTab === 'transcript' && isEditingTranscript && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditingTranscript(false)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-subtle hover:text-white hover:bg-white/5 rounded-md transition-colors focus-ring"
            >
              <Icon name="close" className="text-[14px]" />
              Cancel
            </button>
            <button 
              onClick={handleSaveTranscript}
              className="flex items-center gap-1.5 text-xs font-bold text-background bg-premium-gradient hover:scale-105 transition-all px-3 py-1.5 rounded-md shadow-lg shadow-accent/20 border-t border-border-premium glow-accent"
            >
              <Icon name="save" className="text-[14px]" />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative z-10">
        {activeTab === 'transcript' && (
          <ErrorBoundary fallbackMessage="Failed to load Transcript">
            <TranscriptPanel 
              transcriptionState={transcriptionState}
              isProcessing={isProcessing}
              isEditingTranscript={isEditingTranscript}
              editedTranscript={editedTranscript}
              setEditedTranscript={setEditedTranscript}
            />
          </ErrorBoundary>
        )}
        {activeTab === 'analysis' && (
          <ErrorBoundary fallbackMessage="Failed to load AI Chat">
            <AIChatPanel 
              messages={messages}
              isAnalyzing={isAnalyzing}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          </ErrorBoundary>
        )}
        {activeTab === 'emotions' && (
          <ErrorBoundary fallbackMessage="Failed to load Emotions">
            <EmotionsPanel />
          </ErrorBoundary>
        )}
        {activeTab === 'speech' && (
          <ErrorBoundary fallbackMessage="Failed to load Speech">
            <SpeechPanel />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
});
