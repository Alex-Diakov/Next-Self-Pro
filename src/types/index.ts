export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SessionFile {
  file: File;
  url: string;
  type: 'video' | 'audio';
}

export type TranscriptionStep = 
  | 'idle'
  | 'uploading'
  | 'extracting_audio'
  | 'processing_ai'
  | 'completed'
  | 'error';

export interface TranscriptionState {
  step: TranscriptionStep;
  progress: number; // 0 to 100
  message: string;
  error?: string;
}
