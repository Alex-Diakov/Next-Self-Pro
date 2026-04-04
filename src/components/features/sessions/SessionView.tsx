import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { useSessionStore } from '../../../store/session';
import { VideoPlayerWidget } from './components/VideoPlayerWidget';
import { TranscriptionWidget } from './components/TranscriptionWidget';
import { SessionTimeline } from './components/SessionTimeline';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';

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
  const currentTime = useSessionStore(state => state.currentTime);
  const isPlaying = useSessionStore(state => state.isPlaying);

  const isInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    // If we have a sessionId, load it if not already loaded
    if (sessionId) {
      if (isInitializedRef.current !== `session-${sessionId}`) {
        console.log('SessionView: Initializing session:', sessionId);
        isInitializedRef.current = `session-${sessionId}`;
        loadSession(sessionId);
      }
      return;
    } 
    
    // If we have a file, process it if not already processed
    if (file) {
      if (processedFileRef.current !== file) {
        console.log('SessionView: Processing new file:', file.name);
        processedFileRef.current = file;
        isInitializedRef.current = `file-${file.name}-${file.size}`;
        processFile(file, projectId);
      }
      return;
    }

    // If we have neither, and we've already tried to initialize or it's a fresh mount
    // we should go back, but only if we're sure there's nothing coming
    if (!sessionId && !file) {
      console.log('SessionView: No session or file, triggering onBack');
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

  const lastSeekTimeRef = useRef<number>(-1);

  // Sync store's isPlaying state to media element
  useEffect(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;

    if (isPlaying && mediaEl.paused) {
      mediaEl.play().catch(() => {});
    } else if (!isPlaying && !mediaEl.paused) {
      mediaEl.pause();
    }
  }, [isPlaying]);

  // Sync store's currentTime to media element when seeking
  useEffect(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;

    // Only seek if the difference is significant and it's not the time we just sought to
    const diff = Math.abs(mediaEl.currentTime - currentTime);
    if (diff > 0.5 && Math.abs(lastSeekTimeRef.current - currentTime) > 0.1) {
      lastSeekTimeRef.current = currentTime;
      mediaEl.currentTime = currentTime;
    }
  }, [currentTime]);

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
    <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Column: Media Core */}
      <div className="xl:col-span-8 flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
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

      {/* Right Column: Multifunctional Sidebar */}
      <div className="xl:col-span-4 flex flex-col h-full overflow-hidden">
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
          currentTime={currentTime}
        />
      </div>
    </div>
  );
}

