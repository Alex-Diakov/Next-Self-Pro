export interface Project {
  id: string;          // Уникальный ID проекта
  name: string;        // Имя пациента или название кейса (например, "Alex D. - Anxiety")
  description?: string; // Заметки терапевта по проекту
  status: 'active' | 'archived' | 'completed'; // Статус работы
  createdAt: string;   // Дата создания проекта
  updatedAt: string;
}

export interface Session {
  id: string;
  projectId: string; // ВАЖНО: Связь сессии с конкретным проектом!
  title: string;     // Название видео (например, "Главный 30 сек клип.mov")
  date: string;
  duration?: number;
  status: 'processing' | 'completed' | 'error';
  rawTranscript?: string; 
  summary?: string;
  fileUrl?: string;  // Ссылка на файл в хранилище
}

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
