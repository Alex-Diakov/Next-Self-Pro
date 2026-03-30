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
        You are an expert clinical supervisor and transcriptionist.
        Please provide a highly accurate, verbatim transcript of this therapy session.
        Identify the speakers as 'Therapist' and 'Client' (or similar based on context).
        Include timestamps if possible.
        Format the output clearly using Markdown.
      `;

      if (onProgress) onProgress('processing_ai', 30);

      const response = await this.withRetry(() => this.ai.models.generateContent({
        model: this.defaultModel,
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ],
        config: {
          systemInstruction: "You are an expert clinical psychologist and psychotherapist supervisor. Your goal is to help therapists analyze their sessions, identify cognitive distortions, suggest therapeutic interventions (CBT, ACT, DBT, etc.), and provide professional, empathetic, and scientifically-backed insights. Always maintain a professional, clinical, yet supportive tone."
        }
      }));

      if (onProgress) onProgress('processing_ai', 100);

      return response.text || "No transcript generated.";
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error("Failed to transcribe the session after multiple attempts. Please try again.");
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
      throw new Error("Failed to analyze the session after multiple attempts. Please try again.");
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
