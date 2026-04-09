import { StateCreator } from 'zustand';
import { ChatMessage, TranscriptionState, AnalysisMarker, TranscriptLine } from '../../types';
import { SessionRecord } from '../../services/db.service';

export interface PlayerSlice {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  seekRequest: number | null;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  clearSeekRequest: () => void;
}

export interface TranscriptSlice {
  transcript: string;
  transcriptLines: TranscriptLine[];
  transcriptionState: TranscriptionState;
  updateTranscript: (text: string) => void;
  updateTranscriptLine: (id: string, text: string) => void;
  resetTranscription: () => void;
}

export interface AnalysisSlice {
  markers: AnalysisMarker[];
  isAnalyzing: boolean;
  isAnalyzingEmotions: boolean;
  isAnalyzingSpeech: boolean;
  analysisError?: string | null;
  messages: ChatMessage[];
  runDeepAnalysis: (type?: 'emotion' | 'speech') => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

export interface CoreSlice {
  session: SessionRecord | null;
  sessionFile: File | Blob | null;
  loadSession: (sessionId: string) => Promise<void>;
  processFile: (file: File, projectId?: string) => Promise<void>;
  clearSession: () => void;
  setSessionFile: (file: File | null) => void;
}

export type SessionStore = PlayerSlice & TranscriptSlice & AnalysisSlice & CoreSlice;

export type SessionStateCreator<T> = StateCreator<SessionStore, [], [], T>;
