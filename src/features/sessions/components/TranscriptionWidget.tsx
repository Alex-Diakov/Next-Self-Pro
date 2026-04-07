import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { TranscriptPanel } from './TranscriptPanel';
import { AIChatPanel } from './AIChatPanel';
import { EmotionsPanel } from './EmotionsPanel';
import { SpeechPanel } from './SpeechPanel';
import { TranscriptionState, ChatMessage } from '../../../types';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';

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
  messages: ChatMessage[];
  isAnalyzing: boolean;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
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
  messagesEndRef
}: TranscriptionWidgetProps) {
  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: 'description', disabled: false },
    { id: 'analysis', label: 'AI Analysis', icon: 'auto_awesome', disabled: isProcessing || transcriptionState.step === 'error' },
    { id: 'emotions', label: 'Emotions', icon: 'mood', disabled: false },
    { id: 'speech', label: 'Speech', icon: 'record_voice_over', disabled: false },
  ] as const;

  return (
    <div className="w-full flex flex-col bg-surface rounded-premium border border-border/40 shadow-premium overflow-hidden flex-1 min-h-[400px] relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none z-0"></div>

      {/* Modern Tab Bar */}
      <div className="px-6 pt-6 pb-2 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-4 bg-accent rounded-full"></div>
            Session Insights
          </h3>
          
          <div className="flex items-center gap-2">
            {activeTab === 'transcript' && transcriptionState.step === 'completed' && !isEditingTranscript && (
              <button 
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-subtle hover:text-primary hover:bg-surface-highlight/50 rounded-xl transition-all border border-transparent hover:border-border/40"
              >
                <Icon name="edit" className="text-base" />
                Edit
              </button>
            )}
            {activeTab === 'transcript' && isEditingTranscript && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingTranscript(false)}
                  className="px-3 py-1.5 text-xs font-bold text-subtle hover:text-primary rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveTranscript}
                  className="flex items-center gap-1.5 text-xs font-bold text-background bg-premium-gradient px-4 py-1.5 rounded-xl shadow-lg shadow-accent/20 border-t border-border-premium glow-accent"
                >
                  <Icon name="save" className="text-base" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1.5 bg-surface-hover rounded-2xl border border-border/40 backdrop-blur-sm overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold transition-all rounded-xl relative group",
                activeTab === tab.id 
                  ? "bg-surface-highlight text-primary shadow-sm border border-border/40" 
                  : "text-subtle hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              <Icon name={tab.icon} filled={activeTab === tab.id} className={cn("text-lg", activeTab === tab.id ? "text-accent" : "text-subtle group-hover:text-secondary")} />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-accent rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

