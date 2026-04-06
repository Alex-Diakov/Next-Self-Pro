import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { cn, safeFormatDate } from '../../../lib/utils';
import { useSessionStore } from '../../../store/session';
import { VideoPlayerWidget } from './components/VideoPlayerWidget';
import { TranscriptionWidget } from './components/TranscriptionWidget';
import { SessionTimeline } from './components/SessionTimeline';
import { SessionDetailsCard } from './components/SessionDetailsCard';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';
import { motion } from 'motion/react';

interface SessionViewProps {
  file: File | null;
  sessionId: string | null;
  projectId?: string;
  onBack: () => void;
}

type Tab = 'transcript' | 'analysis' | 'emotions' | 'speech';

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

  const transcript = useSessionStore(state => state.transcript);
  const transcriptionState = useSessionStore(state => state.transcriptionState);
  const messages = useSessionStore(state => state.messages);
  const isAnalyzing = useSessionStore(state => state.isAnalyzing);
  const session = useSessionStore(state => state.session);
  const sessionFile = useSessionStore(state => state.sessionFile);
  const sendMessage = useSessionStore(state => state.sendMessage);
  const updateTranscript = useSessionStore(state => state.updateTranscript);
  const loadSession = useSessionStore(state => state.loadSession);
  const processFile = useSessionStore(state => state.processFile);
  
  const isInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      if (isInitializedRef.current !== `session-${sessionId}`) {
        isInitializedRef.current = `session-${sessionId}`;
        loadSession(sessionId);
      }
      return;
    } 
    
    if (file) {
      if (processedFileRef.current !== file) {
        processedFileRef.current = file;
        isInitializedRef.current = `file-${file.name}-${file.size}`;
        processFile(file, projectId);
      }
      return;
    }

    if (!sessionId && !file) {
      const timer = setTimeout(() => {
        onBack();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sessionId, file, loadSession, processFile, projectId, onBack]);

  useEffect(() => {
    if (sessionFile) {
      const url = URL.createObjectURL(sessionFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [sessionFile]);

  useEffect(() => {
    if (activeTab === 'analysis') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const isProcessing = transcriptionState.step !== 'completed' && transcriptionState.step !== 'error' && transcriptionState.step !== 'idle';
  const isVideo = sessionFile?.type?.startsWith('video/') || session?.fileType?.startsWith('video/');

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAnalyzing || !transcript) return;
    
    const msg = inputMessage;
    setInputMessage('');
    await sendMessage(msg);
  }, [inputMessage, isAnalyzing, transcript, sendMessage]);

  const handleSaveTranscript = useCallback(() => {
    updateTranscript(editedTranscript);
    setIsEditingTranscript(false);
  }, [editedTranscript, updateTranscript]);

  const handleStartEdit = useCallback(() => {
    setEditedTranscript(transcript);
    setIsEditingTranscript(true);
  }, [transcript]);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Session Header */}
      <header className="flex items-center justify-between bg-surface p-4 rounded-3xl border border-border/40 backdrop-blur-md shrink-0 shadow-premium">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-subtle hover:text-primary hover:bg-surface-highlight transition-all border border-border/60 shadow-sm"
          >
            <Icon name="arrow_back" className="text-xl" />
          </button>
          <div className="h-8 w-px bg-border/40 mx-2 hidden sm:block"></div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight line-clamp-1">
              {session?.title || file?.name || 'New Session Analysis'}
            </h1>
            <div className="flex items-center gap-3 text-xs font-medium text-subtle">
              <span className="flex items-center gap-1">
                <Icon name="event" className="text-sm" />
                {safeFormatDate(session?.date || Date.now(), 'MMM d, yyyy')}
              </span>
              <span className="w-1 h-1 rounded-full bg-border/60"></span>
              <span className="flex items-center gap-1">
                <Icon name="attachment" className="text-sm" />
                {session?.fileType || file?.type || 'Media'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border",
            transcriptionState.step === 'completed' ? 'bg-success/10 text-success-muted border-success/20' : 
            isProcessing ? 'bg-accent/10 text-accent-hover border-accent/20' : 
            'bg-error/10 text-error-muted border-error/20'
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              transcriptionState.step === 'completed' ? 'bg-success' : 
              isProcessing ? 'bg-accent animate-pulse' : 
              'bg-error'
            )} />
            {transcriptionState.step.replace('_', ' ')}
          </div>
          <button className="w-10 h-10 rounded-xl bg-surface-highlight flex items-center justify-center text-subtle hover:text-accent transition-all border border-border/60 shadow-sm">
            <Icon name="more_vert" className="text-xl" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Media Core */}
        <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
          <div className="space-y-4">
            <ErrorBoundary fallbackMessage="Failed to load Video Player">
              <VideoPlayerWidget 
                videoUrl={videoUrl}
                isVideo={isVideo}
                isProcessing={isProcessing}
                transcriptionState={transcriptionState}
                file={file}
                videoRef={videoRef}
                audioRef={audioRef}
              />
            </ErrorBoundary>
            <ErrorBoundary fallbackMessage="Failed to load Timeline">
              <SessionTimeline />
            </ErrorBoundary>
          </div>
        </div>

        {/* Right Column: Multifunctional Sidebar */}
        <div className="xl:col-span-5 2xl:col-span-4 flex flex-col h-full overflow-hidden">
          <TranscriptionWidget 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isProcessing={isProcessing}
            transcriptionState={transcriptionState}
            isEditingTranscript={isEditingTranscript}
            setIsEditingTranscript={setIsEditingTranscript}
            handleStartEdit={handleStartEdit}
            handleSaveTranscript={handleSaveTranscript}
            transcript={transcript}
            editedTranscript={editedTranscript}
            setEditedTranscript={setEditedTranscript}
            messages={messages}
            isAnalyzing={isAnalyzing}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
    </div>
  );
}


