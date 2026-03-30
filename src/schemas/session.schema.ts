import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'ai', 'assistant']).catch('user'),
  content: z.string().catch(''),
  timestamp: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val).getTime() : val
  ).catch(() => Date.now()),
});

export const TranscriptionStateSchema = z.object({
  step: z.enum(['idle', 'uploading', 'extracting_audio', 'processing_ai', 'completed', 'error']).catch('idle'),
  progress: z.number().catch(0),
  message: z.string().catch(''),
  error: z.string().optional().catch(undefined),
});

export const SessionRecordSchema = z.object({
  id: z.string(),
  title: z.string().catch('Untitled Session'),
  date: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val).getTime() : val
  ).catch(() => Date.now()),
  file: z.instanceof(Blob).optional().catch(undefined),
  fileName: z.string().catch('unknown_file'),
  fileType: z.string().catch('audio/mpeg'),
  fileSize: z.number().catch(0),
  transcript: z.string().catch(''),
  messages: z.array(ChatMessageSchema).catch([]),
  status: z.enum(['processing', 'completed', 'error']).catch('completed'),
  transcriptionState: TranscriptionStateSchema.optional().catch(undefined),
});

export type ZodSessionRecord = z.infer<typeof SessionRecordSchema>;
export type ZodChatMessage = z.infer<typeof ChatMessageSchema>;
export type ZodTranscriptionState = z.infer<typeof TranscriptionStateSchema>;
