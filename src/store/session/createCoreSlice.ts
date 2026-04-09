import { SessionStateCreator, CoreSlice } from './types';
import { dbService, SessionRecord } from '../../services/db.service';
import { generateId } from '../../lib/utils';
import { saveToDb, fileToBase64, queueSave } from './utils';
import { aiService } from '../../services/ai.service';
import { TranscriptionState, TranscriptLine } from '../../types';

export const createCoreSlice: SessionStateCreator<CoreSlice> = (set, get) => ({
  session: null,
  sessionFile: null,

  setSessionFile: (file) => {
    if (get().sessionFile === file) return;
    set({ sessionFile: file });
  },

  clearSession: () => set({
    session: null,
    sessionFile: null,
    transcript: '',
    messages: [],
    transcriptionState: { step: 'idle', progress: 0, message: 'Initializing...' },
    isAnalyzing: false,
    currentTime: 0,
    isPlaying: false,
    duration: 0,
    seekRequest: null,
    markers: [],
    transcriptLines: [],
  }),

  loadSession: async (sessionId) => {
    const { session } = get();
    // If session is already loaded and it's the same one, don't reload
    if (session?.id === sessionId) {
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
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        seekRequest: null,
      });
    }
  },

  processFile: async (file, projectId = 'default-project') => {
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
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      seekRequest: null,
    });

    // Initial save

    queueSave(() => dbService.saveSession(newSession));

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
      saveToDb(get, set, newSession.id, { status: 'error', transcriptionState: errorState });
      return;
    }

    try {
      set({ transcriptionState: { step: 'extracting_audio', progress: 10, message: 'Reading file...' } });
      saveToDb(get, set, newSession.id, { transcriptionState: { step: 'extracting_audio', progress: 10, message: 'Reading file...' } });
      

      const base64data = await fileToBase64(file);

      
      const finalTranscript = await aiService.transcribeSession(
        base64data, 
        file.type,
        (step, progress) => {
          const newState: TranscriptionState = { 
            step: step as TranscriptionState['step'], 
            progress, 
            message: step === 'processing_ai' ? 'Analyzing audio with AI...' : `Processing: ${progress}%` 
          };
          set({ transcriptionState: newState });
          saveToDb(get, set, newSession.id, { transcriptionState: newState });
        }
      );



      // Parse transcript into lines with a more flexible regex
      const lines: TranscriptLine[] = finalTranscript.split('\n')
        .filter(line => line.trim())
        .map(line => {
          // Matches [MM:SS], [M:SS], [H:MM:SS], [HH:MM:SS] and variations
          const match = line.match(/\[(\d{1,2}:)?\d{1,2}:\d{2}\]?\s*([^:]+):\s*(.*)/);
          if (match) {
            const timestampMatch = line.match(/\[(\d{1,2}:)?\d{1,2}:\d{2}\]/);
            const timestamp = timestampMatch ? timestampMatch[0].replace(/\[|\]/g, '') : '0:00';
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



      const completedState: TranscriptionState = { step: 'completed', progress: 100, message: 'Transcription complete' };
      set({ 
        transcript: finalTranscript,
        transcriptLines: lines,
        transcriptionState: completedState
      });
      saveToDb(get, set, newSession.id, {
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
      saveToDb(get, set, newSession.id, {
        status: 'error',
        transcriptionState: errorState
      });
    }
  },
});
