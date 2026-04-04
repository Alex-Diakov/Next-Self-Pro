import { SessionStateCreator, TranscriptSlice } from './types';
import { saveToDb } from './utils';

export const createTranscriptSlice: SessionStateCreator<TranscriptSlice> = (set, get) => ({
  transcript: '',
  transcriptLines: [],
  transcriptionState: { step: 'idle', progress: 0, message: 'Initializing...' },
  
  updateTranscript: (text) => {
    const { session, transcript } = get();
    if (!session || transcript === text) return;
    set({ transcript: text });
    saveToDb(get, set, session.id, { transcript: text });
  },
  
  updateTranscriptLine: (id, text) => {
    const { transcriptLines } = get();
    const line = transcriptLines.find(l => l.id === id);
    if (!line || line.text === text) return;
    
    set((state) => ({
      transcriptLines: state.transcriptLines.map(line => 
        line.id === id ? { ...line, text, isEdited: true } : line
      )
    }));
  },
  
  resetTranscription: () => set({ 
    transcriptionState: { step: 'idle', progress: 0, message: 'Ready to process' },
    isAnalyzing: false 
  }),
});
