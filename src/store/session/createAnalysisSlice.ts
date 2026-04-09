import { SessionStateCreator, AnalysisSlice } from './types';
import { saveToDb, fileToBase64 } from './utils';
import { aiService } from '../../services/ai.service';
import { generateId } from '../../lib/utils';
import { AnalysisMarker, ChatMessage } from '../../types';

export const createAnalysisSlice: SessionStateCreator<AnalysisSlice> = (set, get) => ({
  markers: [],
  isAnalyzing: false,
  isAnalyzingEmotions: false,
  isAnalyzingSpeech: false,
  analysisError: null,
  messages: [],

  runDeepAnalysis: async (type?: 'emotion' | 'speech') => {
    const { sessionFile, session } = get();
    if (!sessionFile || !session) {
      console.error('Cannot run analysis: Missing session or file');
      return;
    }

    if (type === 'emotion') set({ isAnalyzingEmotions: true, analysisError: null });
    else if (type === 'speech') set({ isAnalyzingSpeech: true, analysisError: null });
    else set({ isAnalyzingEmotions: true, isAnalyzingSpeech: true, analysisError: null });

    try {
      const file = sessionFile as File;
      
      // 20MB limit for inline multimodal analysis (Gemini API limit for inline data)
      const MAX_FILE_SIZE = 20 * 1024 * 1024; 
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 20MB limit for deep multimodal analysis. Please use a smaller file.`);
      }


      const base64data = await fileToBase64(file);

      const rawMarkers = await aiService.analyzeMultimodal(base64data, file.type, type);
      


      if (!Array.isArray(rawMarkers)) {
        throw new Error('Invalid analysis result format: expected array');
      }

      const newMarkers: AnalysisMarker[] = rawMarkers.map(m => {
        const timestamp = typeof m.timestamp === 'string' ? parseFloat(m.timestamp) : (m.timestamp || 0);
        const duration = typeof m.duration === 'string' ? parseFloat(m.duration) : (m.duration || 2);
        
        return {
          id: generateId(),
          timestamp: isNaN(timestamp) ? 0 : timestamp,
          duration: isNaN(duration) ? 2 : duration,
          type: m.type as 'emotion' | 'speech' | 'insight',
          label: m.label || 'Unknown',
          intensity: m.intensity || 0,
          description: m.description || ''
        };
      });



      // If a specific type was requested, merge with existing markers of other types
      const { markers: currentMarkers } = get();
      let finalMarkers = newMarkers;
      
      if (type) {
        const otherMarkers = currentMarkers.filter(m => m.type !== type);
        finalMarkers = [...otherMarkers, ...newMarkers];
      }

      if (type === 'emotion') set({ markers: finalMarkers, isAnalyzingEmotions: false, analysisError: null });
      else if (type === 'speech') set({ markers: finalMarkers, isAnalyzingSpeech: false, analysisError: null });
      else set({ markers: finalMarkers, isAnalyzingEmotions: false, isAnalyzingSpeech: false, analysisError: null });
      
      saveToDb(get, set, session.id, { markers: finalMarkers });

    } catch (error) {
      console.error('Deep analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (type === 'emotion') set({ isAnalyzingEmotions: false, analysisError: errorMessage });
      else if (type === 'speech') set({ isAnalyzingSpeech: false, analysisError: errorMessage });
      else set({ isAnalyzingEmotions: false, isAnalyzingSpeech: false, analysisError: errorMessage });
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
    saveToDb(get, set, session.id, { messages: updatedMessages });

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
      saveToDb(get, set, session.id, { messages: finalMessages });
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
      saveToDb(get, set, session.id, { messages: finalMessages });
    } finally {
      set({ isAnalyzing: false });
    }
  },
});
