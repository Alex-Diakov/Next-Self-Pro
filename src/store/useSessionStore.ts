import { create } from 'zustand';
import { ChatMessage, TranscriptionState, AnalysisMarker, TranscriptLine } from '../types';
import { dbService, SessionRecord } from '../services/db.service';
import { aiService } from '../services/ai.service';
import { generateId } from '../lib/utils';
import { mockMarkers, mockTranscript } from '../lib/mockData';

interface SessionStore {
  session: SessionRecord | null;
  sessionFile: File | Blob | null;
  transcript: string;
  messages: ChatMessage[];
  transcriptionState: TranscriptionState;
  isAnalyzing: boolean;

  // New State
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  markers: AnalysisMarker[];
  transcriptLines: TranscriptLine[];

  // Actions
  loadSession: (sessionId: string) => Promise<void>;
  processFile: (file: File, projectId?: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  updateTranscript: (text: string) => void;
  clearSession: () => void;
  
  // New Actions
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  updateTranscriptLine: (id: string, text: string) => void;
  runDeepAnalysis: () => Promise<void>;
  resetTranscription: () => void;
  setSessionFile: (file: File | null) => void;
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
      await dbService.updateSession(sessionId, updates);
    }).catch(console.error);
  };

  return {
    session: null,
    sessionFile: null,
    transcript: '',
    messages: [],
    transcriptionState: { step: 'idle', progress: 0, message: 'Initializing...' },
    isAnalyzing: false,

    // New State
    currentTime: 0,
    isPlaying: false,
    duration: 0,
    markers: [],
    transcriptLines: [],

    // New Actions
    setCurrentTime: (time: number) => set({ currentTime: time }),
    setDuration: (duration: number) => set({ duration }),
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    seekTo: (time: number) => set({ currentTime: time }),
    updateTranscriptLine: (id: string, text: string) => set((state) => ({
      transcriptLines: state.transcriptLines.map(line => 
        line.id === id ? { ...line, text, isEdited: true } : line
      )
    })),

    runDeepAnalysis: async () => {
      const { sessionFile, session } = get();
      if (!sessionFile || !session) {
        console.warn('Cannot run analysis: Missing session or file');
        return;
      }

      set({ isAnalyzing: true });
      try {
        const file = sessionFile as File;
        console.log('Starting deep analysis for:', file.name || 'session-media');
        const base64data = await fileToBase64(file);
        console.log('Base64 conversion complete, calling AI...');
        const rawMarkers = await aiService.analyzeMultimodal(base64data, file.type);
        
        console.log('AI response received:', rawMarkers);

        if (!Array.isArray(rawMarkers)) {
          throw new Error('Invalid analysis result format: expected array');
        }

        const markers: AnalysisMarker[] = rawMarkers.map(m => {
          const timestamp = typeof m.timestamp === 'string' ? parseFloat(m.timestamp) : (m.timestamp || 0);
          const duration = typeof m.duration === 'string' ? parseFloat(m.duration) : (m.duration || 2);
          
          return {
            id: generateId(),
            timestamp: isNaN(timestamp) ? 0 : timestamp,
            duration: isNaN(duration) ? 2 : duration,
            type: m.type as any,
            label: m.label || 'Unknown',
            intensity: m.intensity || 0,
            description: m.description || ''
          };
        });

        console.log('Processed markers for store:', markers);

        set({ markers, isAnalyzing: false });
        saveToDb(session.id, { markers });
        console.log('Deep analysis completed successfully with', markers.length, 'markers');
      } catch (error) {
        console.error('Deep analysis error:', error);
        set({ isAnalyzing: false });
        // Set an error message if possible
      } finally {
        set({ isAnalyzing: false });
      }
    },

    resetTranscription: () => {
      set({ 
        transcriptionState: { step: 'idle', progress: 0, message: 'Ready to process' },
        isAnalyzing: false 
      });
    },

    setSessionFile: (file: File | null) => {
      set({ sessionFile: file });
    },

    clearSession: () => {
      set({
        session: null,
        sessionFile: null,
        transcript: '',
        messages: [],
        transcriptionState: { step: 'idle', progress: 0, message: 'Initializing...' },
        isAnalyzing: false,
        currentTime: 0,
        isPlaying: false,
        duration: 0,
        markers: [],
        transcriptLines: [],
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
          markers: loadedSession.markers || [],
          transcriptLines: loadedSession.transcriptLines || [],
          transcriptionState: loadedSession.transcriptionState || { step: 'completed', progress: 100, message: 'Loaded' },
          sessionFile: loadedSession.file || null,
        });
      }
    },

    processFile: async (file: File, projectId: string = 'default-project') => {
      const newSession: SessionRecord = {
        id: generateId(),
        projectId,
        title: file.name,
        date: Date.now(),
        file: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        transcript: '',
        messages: [],
        status: 'processing',
        transcriptionState: { step: 'uploading', progress: 0, message: 'Starting process...' },
        markers: [],
        transcriptLines: []
      };

      set({
        session: newSession,
        sessionFile: file,
        transcript: '',
        messages: [],
        markers: [],
        transcriptLines: [],
        transcriptionState: newSession.transcriptionState,
      });

      // Initial save
      console.log('useSessionStore: Queueing initial save for session:', newSession.id);
      saveQueue = saveQueue.then(() => dbService.saveSession(newSession)).catch(err => {
        console.error('useSessionStore: Failed to save initial session:', err);
      });

      // 100MB limit for inline base64 processing to stay within Gemini API limits
      const MAX_FILE_SIZE = 100 * 1024 * 1024; 
      if (file.size > MAX_FILE_SIZE) {
        const errorState: TranscriptionState = { 
          step: 'error', 
          progress: 0, 
          message: 'File too large', 
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 100MB limit for direct processing. Please upload a smaller file.` 
        };
        set({ transcriptionState: errorState });
        saveToDb(newSession.id, { status: 'error', transcriptionState: errorState });
        return;
      }

      try {
        set({ transcriptionState: { step: 'extracting_audio', progress: 10, message: 'Reading file...' } });
        saveToDb(newSession.id, { transcriptionState: { step: 'extracting_audio', progress: 10, message: 'Reading file...' } });
        
        console.log('Starting file processing for session:', newSession.id);
        const base64data = await fileToBase64(file);
        console.log('Base64 conversion complete, calling AI for transcription...');
        
        const finalTranscript = await aiService.transcribeSession(
          base64data, 
          file.type,
          (step, progress) => {
            const newState: TranscriptionState = { 
              step: step as TranscriptionState['step'], 
              progress, 
              message: `AI Processing: ${progress}%` 
            };
            set({ transcriptionState: newState });
            saveToDb(newSession.id, { transcriptionState: newState });
          }
        );

        console.log('Transcription AI response received, length:', finalTranscript.length);

        // Parse transcript into lines with a more flexible regex
        const lines: TranscriptLine[] = finalTranscript.split('\n')
          .filter(line => line.trim())
          .map(line => {
            // Matches [MM:SS], [M:SS], [H:MM:SS], [HH:MM:SS] and variations
            const match = line.match(/\[(\d{1,2}:)?\d{1,2}:\d{2}\]?\s*([^:]+):\s*(.*)/);
            if (match) {
              const timestampMatch = line.match(/\[(\d{1,2}:)?\d{1,2}:\d{2}\]/);
              const timestamp = timestampMatch ? timestampMatch[0].replace(/[\[\]]/g, '') : '0:00';
              const speaker = match[2].trim();
              const text = match[3].trim();
              return {
                id: generateId(),
                timestamp,
                speaker,
                text
              };
            }
            // Fallback for lines that might not match perfectly but have a speaker
            const fallbackMatch = line.match(/^([^:]+):\s*(.*)/);
            if (fallbackMatch && !line.startsWith('[')) {
              return {
                id: generateId(),
                timestamp: '0:00',
                speaker: fallbackMatch[1].trim(),
                text: fallbackMatch[2].trim()
              };
            }
            return null;
          })
          .filter((l): l is TranscriptLine => l !== null);

        console.log('Parsed', lines.length, 'transcript lines');

        const completedState: TranscriptionState = { step: 'completed', progress: 100, message: 'Transcription complete' };
        set({ 
          transcript: finalTranscript,
          transcriptLines: lines,
          transcriptionState: completedState
        });
        saveToDb(newSession.id, {
          transcript: finalTranscript,
          transcriptLines: lines,
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
        id: generateId(),
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
          id: generateId(),
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
          id: generateId(),
          role: 'assistant',
          content: `**Error:** ${error instanceof Error ? error.message : 'Failed to analyze request. Please try again.'}`,
          timestamp: Date.now()
        };
        const finalMessages = [...updatedMessages, errorMessage];
        set({ messages: finalMessages, isAnalyzing: false });
        saveToDb(session.id, { messages: finalMessages });
      } finally {
        set({ isAnalyzing: false });
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
