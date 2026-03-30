import { describe, it, expect } from 'vitest';
import { SessionRecordSchema, ChatMessageSchema, TranscriptionStateSchema } from './session.schema';

describe('SessionRecordSchema', () => {
  it('should parse a valid session record', () => {
    const validData = {
      id: '123',
      title: 'Test Session',
      date: Date.now(),
      fileName: 'test.mp3',
      fileType: 'audio/mp3',
      fileSize: 1024,
      transcript: 'Hello world',
      messages: [],
      status: 'completed'
    };
    const result = SessionRecordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should apply default values for missing fields', () => {
    const partialData = {
      id: '456',
    };
    const result = SessionRecordSchema.safeParse(partialData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Untitled Session');
      expect(result.data.status).toBe('completed');
      expect(result.data.messages).toEqual([]);
      expect(result.data.fileSize).toBe(0);
    }
  });

  it('should transform string dates to numbers', () => {
    const dateString = '2026-03-30T08:00:00.000Z';
    const data = {
      id: '789',
      date: dateString
    };
    const result = SessionRecordSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.date).toBe('number');
      expect(result.data.date).toBe(new Date(dateString).getTime());
    }
  });
});

describe('ChatMessageSchema', () => {
  it('should fallback to user role if invalid role is provided', () => {
    const data = {
      id: 'msg1',
      role: 'invalid_role',
      content: 'Hello',
      timestamp: Date.now()
    };
    const result = ChatMessageSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('user');
    }
  });

  it('should fallback to empty string if content is missing', () => {
    const data = {
      id: 'msg2',
      role: 'ai',
      timestamp: Date.now()
    };
    const result = ChatMessageSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('');
    }
  });
});

describe('TranscriptionStateSchema', () => {
  it('should fallback to idle step if invalid step is provided', () => {
    const data = {
      step: 'invalid_step',
      progress: 50,
      message: 'Processing...'
    };
    const result = TranscriptionStateSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.step).toBe('idle');
    }
  });
});
