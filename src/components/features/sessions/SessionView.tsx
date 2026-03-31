import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { useSessionStore } from '../../../store/useSessionStore';
import { MediaPanel } from './components/MediaPanel';
import { TranscriptPanel } from './components/TranscriptPanel';
import { AnalysisPanel } from './components/AnalysisPanel';

interface SessionViewProps {
  file: File | null;
  sessionId: string | null;
  projectId?: string;
  onBack: () => void;
}

type Tab = 'transcript' | 'analysis';

export function SessionView({ file, sessionId, projectId, onBack }: SessionViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('transcript');
  const [inputMessage, setInputMessage] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const processedFileRef = useRef<File | null>(null);

  const { 
    transcript, 
    transcriptionState, 
    messages, 
    isAnalyzing, 
    session,
    sessionFile,
    sendMessage,
    updateTranscript,
    loadSession,
    processFile
  } = useSessionStore();

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    } else if (file && processedFileRef.current !== file) {
      processedFileRef.current = file;
      processFile(file, projectId);
    }
  }, [sessionId, file, loadSession, processFile, projectId]);

  useEffect(() => {
    if (sessionFile) {
      const url = URL.createObjectURL(sessionFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [sessionFile]);

  useEffect(() => {
    if (activeTab === 'analysis') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAnalyzing || !transcript) return;
    
    const msg = inputMessage;
    setInputMessage('');
    await sendMessage(msg);
  };

  const handleSaveTranscript = () => {
    updateTranscript(editedTranscript);
    setIsEditingTranscript(false);
  };

  const handleStartEdit = () => {
    setEditedTranscript(transcript);
    setIsEditingTranscript(true);
  };

  const isProcessing = transcriptionState.step !== 'completed' && transcriptionState.step !== 'error' && transcriptionState.step !== 'idle';
  const isVideo = sessionFile?.type?.startsWith('video/') || session?.fileType?.startsWith('video/');

  const handleSeek = (timeString: string) => {
    const parts = timeString.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      <MediaPanel 
        onBack={onBack}
        videoUrl={videoUrl}
        isVideo={isVideo}
        isProcessing={isProcessing}
        transcriptionState={transcriptionState}
        session={session}
        file={file}
        videoRef={videoRef}
        audioRef={audioRef}
      />

      <div className="w-full lg:w-8/12 flex flex-col card-premium backdrop-blur-xl overflow-hidden h-[calc(100vh-8rem)] relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none"></div>

        <div className="flex items-center justify-between p-4 border-b border-border bg-background/40 relative z-10">
          <div className="flex bg-background/80 p-1.5 rounded-2xl w-full max-w-md border border-border shadow-inner">
            <button
              onClick={() => setActiveTab('transcript')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 focus-ring border-t border-transparent",
                activeTab === 'transcript' 
                  ? "bg-surface-hover text-primary shadow-md border-border-hover border-t-white/10" 
                  : "text-subtle hover:text-secondary hover:bg-surface/50"
              )}
            >
              <Icon name="description" filled={activeTab === 'transcript'} className="text-lg" />
              Transcription
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={isProcessing || transcriptionState.step === 'error'}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 focus-ring border-t border-transparent",
                activeTab === 'analysis' 
                  ? "bg-accent/10 text-accent-hover shadow-md border-accent/20 border-t-white/10 glow-accent" 
                  : "text-subtle hover:text-secondary hover:bg-surface/50 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Icon name="auto_awesome" filled={activeTab === 'analysis'} className="text-lg" />
              AI Analysis
            </button>
          </div>
          
          {activeTab === 'transcript' && transcriptionState.step === 'completed' && !isEditingTranscript && (
            <button 
              onClick={handleStartEdit}
              className="mr-2 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent-hover transition-colors px-3 py-1.5 rounded-xl hover:bg-surface-hover focus-ring"
            >
              <Icon name="edit" className="text-lg" />
              Edit
            </button>
          )}
          {activeTab === 'transcript' && isEditingTranscript && (
            <div className="flex items-center gap-2 mr-2">
              <button 
                onClick={() => setIsEditingTranscript(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-secondary transition-colors px-3 py-1.5 rounded-xl hover:bg-surface-hover focus-ring"
              >
                <Icon name="close" className="text-lg" />
                Cancel
              </button>
              <button 
                onClick={handleSaveTranscript}
                className="flex items-center gap-1.5 text-sm font-bold text-background bg-premium-gradient hover:scale-105 transition-all px-4 py-2 rounded-xl shadow-lg shadow-accent/20 border-t border-white/20 glow-accent"
              >
                <Icon name="save" className="text-lg" />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative z-10">
          {activeTab === 'transcript' ? (
            <TranscriptPanel 
              transcript={transcript}
              transcriptionState={transcriptionState}
              isProcessing={isProcessing}
              isEditingTranscript={isEditingTranscript}
              editedTranscript={editedTranscript}
              setEditedTranscript={setEditedTranscript}
              handleSeek={handleSeek}
            />
          ) : (
            <AnalysisPanel 
              messages={messages}
              isAnalyzing={isAnalyzing}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}

