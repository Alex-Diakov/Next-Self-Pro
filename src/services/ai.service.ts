import { GoogleGenAI } from '@google/genai';

class AIService {
  private _ai: GoogleGenAI | null = null;
  private defaultModel: string;

  constructor() {
    this.defaultModel = 'gemini-3-flash-preview';
  }

  private get ai(): GoogleGenAI {
    if (!this._ai) {
      this._ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });
    }
    return this._ai;
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        console.warn(`AI Operation failed (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt >= maxRetries) {
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s... plus some jitter
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries reached");
  }

  async transcribeSession(base64Data: string, mimeType: string, onProgress?: (step: string, progress: number) => void): Promise<string> {
    try {
      if (onProgress) onProgress('processing_ai', 10);

      const prompt = `
        You are a professional transcriptionist. Your ONLY task is to transcribe the provided audio/video.
        
        STRICT RULES:
        1. ONLY output the transcription. Do NOT include any metadata, summaries, introductions, or analysis.
        2. Do NOT translate the text. Transcribe EXACTLY in the original language spoken in the media.
        3. Format each line strictly as: [MM:SS] Speaker Name: Text
        4. Identify speakers as 'Therapist' and 'Client' (or similar based on context), or 'Speaker 1', 'Speaker 2'.
        5. Do NOT add any clinical analysis, cognitive distortion identification, or therapeutic suggestions.
        6. The output must be pure text following the format above.
      `;

      if (onProgress) onProgress('processing_ai', 30);

      const response = await this.withRetry(() => this.ai.models.generateContent({
        model: this.defaultModel,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        },
        config: {
          maxOutputTokens: 8192,
          systemInstruction: "You are a professional, highly accurate transcriptionist. Your sole purpose is to transcribe audio/video exactly as spoken, in the original language, with timestamps. You do not analyze, translate, or summarize."
        }
      }));

      if (onProgress) onProgress('processing_ai', 100);

      return response.text || "No transcript generated.";
    } catch (error) {
      console.error("Transcription error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to transcribe the session: ${errorMessage}`, { cause: error });
    }
  }

  async analyzeSession(transcript: string, prompt: string): Promise<string> {
    try {
      const response = await this.withRetry(() => this.ai.models.generateContent({
        model: this.defaultModel,
        contents: [
          `Here is the transcript of a therapy session:\n\n<transcript>\n${transcript}\n</transcript>\n\nAs an expert psychotherapist supervisor and clinical assistant, please respond to the following request based on the transcript:\n\n${prompt}`
        ],
        config: {
          systemInstruction: "You are an expert clinical psychologist and psychotherapist supervisor. Your goal is to help therapists analyze their sessions, identify cognitive distortions, suggest therapeutic interventions (CBT, ACT, DBT, etc.), and provide professional, empathetic, and scientifically-backed insights. Always maintain a professional, clinical, yet supportive tone."
        }
      }));
      return response.text || "No response generated.";
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to analyze the session: ${errorMessage}`, { cause: error });
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
