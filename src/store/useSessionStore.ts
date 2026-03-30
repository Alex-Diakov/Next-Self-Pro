import { create } from 'zustand';
import { ChatMessage, TranscriptionState } from '../types';
import { dbService, SessionRecord } from '../services/db.service';
import { aiService } from '../services/ai.service';

interface SessionStore {
  session: SessionRecord | null;
  sessionFile: File | Blob | null;
  transcript: string;
  messages: ChatMessage[];
  transcriptionState: TranscriptionState;
  isAnalyzing: boolean;

  // Actions
  loadSession: (sessionId: string) => Promise<void>;
  processFile: (file: File) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  updateTranscript: (text: string) => void;
  clearSession: () => void;
}

// Module-level queue to prevent race conditions when saving to DB
let saveQueue = Promise.resolve();

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 part from the Data URL
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
};

export const useSessionStore = create<SessionStore>((set, get) => {
  const saveToDb = (sessionId: string, updates: Partial<SessionRecord>) => {
    const { session } = get();
    
    // If the session is still active in the store, update the store state
    if (session && session.id === sessionId) {
      set({ session: { ...session, ...updates } });
    }

    // Always save to DB, even if the user navigated away
    saveQueue = saveQueue.then(async () => {
      const existing = await dbService.getSession(sessionId);
      if (existing) {
        await dbService.saveSession({ ...existing, ...updates });
      }
    }).catch(console.error);
  };

  return {
    session: null,
    sessionFile: null,
    transcript: '',
    messages: [],
    transcriptionState: { step: 'idle', progress: 0, message: 'Initializing...' },
    isAnalyzing: false,

    clearSession: () => {
      set({
        session: null,
        sessionFile: null,
        transcript: '',
        messages: [],
        transcriptionState: { step: 'idle', progress: 0, message: 'Initializing...' },
        isAnalyzing: false,
      });
    },

    loadSession: async (sessionId: string) => {
      const { session } = get();
      if (session?.id === sessionId && session.status === 'processing') {
        return;
      }

      const loadedSession = await dbService.getSession(sessionId);
      if (loadedSession) {
        set({
          session: loadedSession,
          transcript: loadedSession.transcript,
          messages: loadedSession.messages,
          transcriptionState: loadedSession.transcriptionState || { step: 'completed', progress: 100, message: 'Loaded' },
          sessionFile: loadedSession.file || null,
        });
      }
    },

    processFile: async (file: File) => {
      // 20MB limit for inline base64 processing
      const MAX_FILE_SIZE = 20 * 1024 * 1024; 
      if (file.size > MAX_FILE_SIZE) {
        const errorState: TranscriptionState = { 
          step: 'error', 
          progress: 0, 
          message: 'File too large', 
          error: `File size exceeds the 20MB limit. Please upload a smaller file.` 
        };
        set({ transcriptionState: errorState });
        return;
      }

      const newSession: SessionRecord = {
        id: crypto.randomUUID(),
        title: file.name,
        date: Date.now(),
        file: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        transcript: '',
        messages: [],
        status: 'processing',
        transcriptionState: { step: 'uploading', progress: 0, message: 'Starting process...' }
      };

      set({
        session: newSession,
        sessionFile: file,
        transcript: '',
        messages: [],
        transcriptionState: newSession.transcriptionState,
      });

      // Initial save
      saveQueue = saveQueue.then(() => dbService.saveSession(newSession)).catch(console.error);

      try {
        set({ transcriptionState: { step: 'extracting_audio', progress: 10, message: 'Reading file...' } });
        saveToDb(newSession.id, { transcriptionState: { step: 'extracting_audio', progress: 10, message: 'Reading file...' } });
        
        const base64data = await fileToBase64(file);
        
        const finalTranscript = await aiService.transcribeSession(
          base64data, 
          file.type,
          (step, progress) => {
            const newState: TranscriptionState = { 
              step: step as any, 
              progress, 
              message: 'Analyzing with AI...' 
            };
            set({ transcriptionState: newState });
            saveToDb(newSession.id, { transcriptionState: newState });
          }
        );

        const completedState: TranscriptionState = { step: 'completed', progress: 100, message: 'Transcription complete' };
        set({ 
          transcript: finalTranscript,
          transcriptionState: completedState
        });
        saveToDb(newSession.id, {
          transcript: finalTranscript,
          status: 'completed',
          transcriptionState: completedState
        });
      } catch (error) {
        console.error('File processing/transcription error:', error);
        const errorState: TranscriptionState = { 
          step: 'error', 
          progress: 0, 
          message: 'Processing failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        set({ transcriptionState: errorState });
        saveToDb(newSession.id, {
          status: 'error',
          transcriptionState: errorState
        });
      }
    },

    sendMessage: async (content: string) => {
      const { session, transcript, messages } = get();
      if (!session || !transcript) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now()
      };

      const updatedMessages = [...messages, userMessage];
      set({ messages: updatedMessages, isAnalyzing: true });
      saveToDb(session.id, { messages: updatedMessages });

      try {
        const response = await aiService.analyzeSession(transcript, content);
        
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        set({ messages: finalMessages, isAnalyzing: false });
        saveToDb(session.id, { messages: finalMessages });
      } catch (error) {
        console.error('Analysis error:', error);
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `**Error:** ${error instanceof Error ? error.message : 'Failed to analyze request. Please try again.'}`,
          timestamp: Date.now()
        };
        const finalMessages = [...updatedMessages, errorMessage];
        set({ messages: finalMessages, isAnalyzing: false });
        saveToDb(session.id, { messages: finalMessages });
      }
    },

    updateTranscript: (text: string) => {
      const { session } = get();
      if (!session) return;
      set({ transcript: text });
      saveToDb(session.id, { transcript: text });
    }
  };
});
