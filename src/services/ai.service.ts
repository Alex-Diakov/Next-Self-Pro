import { GoogleGenAI, Type } from '@google/genai';

class AIService {
  private _ai: GoogleGenAI | null = null;
  private defaultModel: string;

  constructor() {
    this.defaultModel = 'gemini-3-flash-preview';
  }

  private get ai(): GoogleGenAI {
    if (!this._ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in the environment. Please check your configuration.");
      }
      this._ai = new GoogleGenAI({ apiKey });
    }
    return this._ai;
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3, timeoutMs = 180000): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("AI operation timed out")), timeoutMs)
        );
        return await Promise.race([operation(), timeoutPromise]) as T;
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
      console.log('AIService: Starting transcription process...');
      if (onProgress) onProgress('processing_ai', 10);

      const prompt = `
        You are a professional transcriptionist. Your ONLY task is to transcribe the provided audio/video.
        
        STRICT RULES:
        1. ONLY output the transcription. Do NOT include any metadata, summaries, introductions, or analysis.
        2. Do NOT translate the text. Transcribe EXACTLY in the original language spoken in the media (e.g., if they speak Russian, transcribe in Russian).
        3. Format each line strictly as: [MM:SS] Speaker Name: Text
        4. Identify speakers as 'Терапевт' and 'Клиент' (if in Russian) or 'Therapist' and 'Client' (if in English).
        5. Do NOT add any clinical analysis, cognitive distortion identification, or therapeutic suggestions.
        6. The output must be pure text following the format above.
        7. Ensure every spoken word is captured accurately without hallucination.
      `;

      if (onProgress) onProgress('processing_ai', 30);

      console.log('AIService: Sending request to Gemini API...');
      const response = await this.withRetry(() => this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }],
        config: {
          maxOutputTokens: 8192,
          systemInstruction: "You are a professional, highly accurate transcriptionist. Your sole purpose is to transcribe audio/video exactly as spoken, in the original language, with timestamps. You do not analyze, translate, or summarize."
        }
      }));

      console.log('AIService: Transcription response received successfully');
      if (onProgress) onProgress('processing_ai', 100);

      return response.text || "No transcript generated.";
    } catch (error) {
      console.error("AIService: Transcription error:", error);
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

  private extractJson(text: string): any {
    try {
      // Try parsing directly first
      return JSON.parse(text);
    } catch (e) {
      // Try to find JSON in markdown blocks
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch (e2) {
          console.error("Failed to parse JSON from markdown block:", e2);
        }
      }
      
      // Try to find anything that looks like a JSON array or object
      const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e3) {
          console.error("Failed to parse JSON from regex match:", e3);
        }
      }
      
      throw new Error("Could not extract valid JSON from AI response");
    }
  }

  async analyzeMultimodal(base64Data: string, mimeType: string): Promise<any[]> {
    try {
      const prompt = `Analyze the provided video/audio session. Focus on:
1. Emotional shifts (micro-expressions, tone changes).
2. Speech patterns (hesitations, speed, volume).
3. Psychological insights (resistance, breakthroughs, defense mechanisms).

CRITICAL: For 'emotion' type, use these labels ONLY: 'Anxiety', 'Sadness', 'Anger', 'Relief', 'Fear', 'Joy', 'Confusion'.
For 'speech' type, use these labels ONLY: 'Stuttering', 'Rapid Speech', 'Long Pause', 'Whispering'.
For 'insight' type, use descriptive clinical labels.

Output ONLY a JSON array of markers.`;

      const response = await this.withRetry(() => this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.NUMBER, description: "Time in seconds from start" },
                duration: { type: Type.NUMBER, description: "Duration in seconds" },
                type: { type: Type.STRING, enum: ["emotion", "speech", "insight"] },
                label: { type: Type.STRING, description: "Short label (e.g., 'Anxiety', 'Rapid Speech')" },
                intensity: { type: Type.NUMBER, description: "Scale 0-1" },
                description: { type: Type.STRING, description: "Detailed clinical observation" }
              },
              required: ["timestamp", "type", "label", "intensity", "description"]
            }
          },
          systemInstruction: "You are a professional clinical psychologist and behavioral analyst. Your task is to perform a deep multimodal analysis of a therapy session. You must identify emotional states, speech characteristics, and psychological insights. Provide timestamps and detailed descriptions for each observation. Output the results in a structured JSON format."
        }
      }));

      const text = response.text || "[]";
      return this.extractJson(text);
    } catch (error) {
      console.error("Multimodal analysis error:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
