import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../ai.service';
import { GoogleGenAI } from '@google/genai';

// Mock the @google/genai module
vi.mock('@google/genai', () => {
  const GoogleGenAI = vi.fn();
  GoogleGenAI.prototype.models = {
    generateContent: vi.fn()
  };
  return { GoogleGenAI };
});

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transcribe a session', async () => {
    const mockResponse = { text: 'Mocked transcript' };
    const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
    
    // @ts-ignore - accessing private property for testing
    aiService.ai.models.generateContent = mockGenerateContent;

    const result = await aiService.transcribeSession('base64data', 'audio/wav');
    
    expect(result).toBe('Mocked transcript');
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('should handle transcription errors and retry', async () => {
    const mockGenerateContent = vi.fn()
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({ text: 'Success after retry' });

    // @ts-ignore
    aiService.ai.models.generateContent = mockGenerateContent;

    const result = await aiService.transcribeSession('base64data', 'audio/wav');
    
    expect(result).toBe('Success after retry');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('should analyze a session', async () => {
    const mockResponse = { text: 'Mocked analysis' };
    const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
    
    // @ts-ignore
    aiService.ai.models.generateContent = mockGenerateContent;

    const result = await aiService.analyzeSession('Transcript text', 'Analyze this');
    
    expect(result).toBe('Mocked analysis');
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
