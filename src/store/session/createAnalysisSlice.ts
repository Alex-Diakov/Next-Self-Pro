import { SessionStateCreator, AnalysisSlice } from './types';
import { saveToDb, fileToBase64 } from './utils';
import { aiService } from '../../services/ai.service';
import { generateId } from '../../lib/utils';
import { AnalysisMarker, ChatMessage } from '../../types';

export const createAnalysisSlice: SessionStateCreator<AnalysisSlice> = (set, get) => ({
  markers: [],
  isAnalyzing: false,
  analysisError: null,
  messages: [],

  runDeepAnalysis: async (type?: 'emotion' | 'speech') => {
    const { sessionFile, session } = get();
    if (!sessionFile || !session) {
      console.warn('Cannot run analysis: Missing session or file');
      return;
    }

    set({ isAnalyzing: true, analysisError: null });
    try {
      const file = sessionFile as File;
      console.log(`Starting deep analysis for: ${file.name || 'session-media'} (type: ${type || 'all'})`);
      const base64data = await fileToBase64(file);
      console.log('Base64 conversion complete, calling AI...');
      const rawMarkers = await aiService.analyzeMultimodal(base64data, file.type, type);
      
      console.log('AI response received:', rawMarkers);

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

      console.log('Processed markers for store:', newMarkers);

      // If a specific type was requested, merge with existing markers of other types
      const { markers: currentMarkers } = get();
      let finalMarkers = newMarkers;
      
      if (type) {
        const otherMarkers = currentMarkers.filter(m => m.type !== type);
        finalMarkers = [...otherMarkers, ...newMarkers];
      }

      set({ markers: finalMarkers, isAnalyzing: false, analysisError: null });
      saveToDb(get, set, session.id, { markers: finalMarkers });
      console.log('Deep analysis completed successfully with', finalMarkers.length, 'markers');
    } catch (error) {
      console.error('Deep analysis error:', error);
      set({ isAnalyzing: false, analysisError: error instanceof Error ? error.message : 'Unknown error' });
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
