import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { useSessionStore } from '../../../store/useSessionStore';
import { VideoPlayerWidget } from './components/VideoPlayerWidget';
import { TranscriptionWidget } from './components/TranscriptionWidget';
import { SessionTimeline } from './components/SessionTimeline';

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
    processFile,
    currentTime,
    duration,
    isPlaying,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    togglePlay
  } = useSessionStore();

  useEffect(() => {
    console.log('SessionView: useEffect triggered', { sessionId, hasFile: !!file });
    if (sessionId) {
      loadSession(sessionId);
    } else if (file && processedFileRef.current !== file) {
      console.log('SessionView: Starting file processing');
      processedFileRef.current = file;
      processFile(file, projectId);
    } else if (!file && !sessionId) {
      console.log('SessionView: No file and no sessionId, redirecting back');
      onBack();
    }
  }, [sessionId, file, loadSession, processFile, projectId, onBack]);

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

  const isProcessing = transcriptionState.step !== 'completed' && transcriptionState.step !== 'error' && transcriptionState.step !== 'idle';
  const isVideo = sessionFile?.type?.startsWith('video/') || session?.fileType?.startsWith('video/');

  useEffect(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;

    const updateTime = () => setCurrentTime(mediaEl.currentTime);
    const updateDuration = () => setDuration(mediaEl.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    mediaEl.addEventListener('timeupdate', updateTime);
    mediaEl.addEventListener('loadedmetadata', updateDuration);
    mediaEl.addEventListener('play', handlePlay);
    mediaEl.addEventListener('pause', handlePause);
    
    if (mediaEl.readyState >= 1) {
      setDuration(mediaEl.duration);
    }

    return () => {
      mediaEl.removeEventListener('timeupdate', updateTime);
      mediaEl.removeEventListener('loadedmetadata', updateDuration);
      mediaEl.removeEventListener('play', handlePlay);
      mediaEl.removeEventListener('pause', handlePause);
    };
  }, [videoUrl, isVideo, setCurrentTime, setDuration, setIsPlaying]);

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

    // Only seek if the difference is significant (e.g., > 0.5s) to avoid stuttering during normal playback
    if (Math.abs(mediaEl.currentTime - currentTime) > 0.5) {
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

  const handleSeekTo = useCallback((seconds: number, play: boolean = false) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (play) videoRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      if (play) audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleSeek = useCallback((timeString: string) => {
    const parts = timeString.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    handleSeekTo(seconds, true);
  }, [handleSeekTo]);

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Column: Media Core */}
      <div className="xl:col-span-8 flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
        <VideoPlayerWidget 
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
        <SessionTimeline />
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
          handleSeek={handleSeek}
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

