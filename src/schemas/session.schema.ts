import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string().catch(() => Math.random().toString(36).substring(2, 9)),
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

export const AnalysisMarkerSchema = z.object({
  id: z.string().catch(() => Math.random().toString(36).substring(2, 9)),
  timestamp: z.number().catch(0),
  duration: z.number().optional().catch(undefined),
  type: z.enum(['emotion', 'speech', 'insight']).catch('insight'),
  label: z.string().catch('Analysis'),
  intensity: z.number().catch(0),
  description: z.string().catch(''),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed']).catch('active'),
  createdAt: z.string().catch(() => new Date().toISOString()),
  updatedAt: z.string().catch(() => new Date().toISOString()),
});

export const TranscriptLineSchema = z.object({
  id: z.string().catch(() => Math.random().toString(36).substring(2, 9)),
  timestamp: z.string().catch('00:00'),
  speaker: z.string().catch('Unknown'),
  text: z.string().catch(''),
  isEdited: z.boolean().optional().catch(undefined),
});

export const SessionRecordSchema = z.object({
  id: z.string(),
  projectId: z.string().catch('default-project'),
  title: z.string().catch('Untitled Session'),
  date: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val).getTime() : val
  ).catch(() => Date.now()),
  file: z.custom<File | Blob>().optional().catch(undefined),
  fileName: z.string().catch('unknown_file'),
  fileType: z.string().catch('audio/mpeg'),
  fileSize: z.number().catch(0),
  transcript: z.string().catch(''),
  summary: z.string().optional().catch(undefined),
  transcriptLines: z.array(TranscriptLineSchema).optional().catch([]),
  messages: z.array(ChatMessageSchema).catch([]),
  status: z.enum(['processing', 'completed', 'error']).catch('completed'),
  transcriptionState: TranscriptionStateSchema.optional().catch(undefined),
  markers: z.array(AnalysisMarkerSchema).optional().catch([]),
});

export type ZodSessionRecord = z.infer<typeof SessionRecordSchema>;
export type ZodChatMessage = z.infer<typeof ChatMessageSchema>;
export type ZodTranscriptionState = z.infer<typeof TranscriptionStateSchema>;
