import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from './useSessionStore';
import { dbService, SessionRecord } from '../services/db.service';

// Mock the services
vi.mock('../services/db.service', () => ({
  dbService: {
    getSession: vi.fn(),
    saveSession: vi.fn(),
    getAllSessions: vi.fn(),
    deleteSession: vi.fn(),
  }
}));

vi.mock('../services/ai.service', () => ({
  aiService: {
    transcribeSession: vi.fn(),
    analyzeSession: vi.fn(),
  }
}));

// Mock the worker
vi.mock('../workers/fileProcessor.worker?worker', () => {
  return {
    default: class MockWorker {
      onmessage: ((ev: MessageEvent) => void) | null = null;
      onerror: ((ev: ErrorEvent) => void) | null = null;
      postMessage(_data: unknown) {
        setTimeout(() => {
          if (this.onmessage) {
            this.onmessage({ data: { success: true, base64data: 'mock-base64' } } as MessageEvent);
          }
        }, 10);
      }
      terminate() {}
    }
  };
});

describe('useSessionStore', () => {
  beforeEach(() => {
    // Reset store state
    useSessionStore.getState().clearSession();
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const state = useSessionStore.getState();
    expect(state.session).toBeNull();
    expect(state.sessionFile).toBeNull();
    expect(state.transcript).toBe('');
    expect(state.messages).toEqual([]);
    expect(state.isAnalyzing).toBe(false);
  });

  it('should clear session correctly', () => {
    // Set some state
    useSessionStore.setState({
      transcript: 'Test transcript',
      messages: [{ id: '1', role: 'user', content: 'Hello', timestamp: Date.now() }]
    });

    // Clear it
    useSessionStore.getState().clearSession();

    // Verify
    const state = useSessionStore.getState();
    expect(state.transcript).toBe('');
    expect(state.messages).toEqual([]);
  });

  it('should load a session from DB', async () => {
    const mockSession = {
      id: 'test-123',
      title: 'Test Session',
      date: Date.now(),
      fileName: 'test.mp3',
      fileType: 'audio/mp3',
      fileSize: 1024,
      transcript: 'Loaded transcript',
      messages: [{ id: 'msg1', role: 'user', content: 'Hi', timestamp: Date.now() }],
      status: 'completed',
      transcriptionState: { step: 'completed', progress: 100, message: 'Done' }
    };

    vi.mocked(dbService.getSession).mockResolvedValueOnce(mockSession as unknown as SessionRecord);

    await useSessionStore.getState().loadSession('test-123');

    const state = useSessionStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.transcript).toBe('Loaded transcript');
    expect(state.messages.length).toBe(1);
    expect(state.transcriptionState.step).toBe('completed');
  });

  it('should update transcript and save to DB', () => {
    useSessionStore.setState({
      session: { id: 'test-123' } as unknown as SessionRecord
    });

    useSessionStore.getState().updateTranscript('New transcript');

    const state = useSessionStore.getState();
    expect(state.transcript).toBe('New transcript');
    
    // The saveToDb function is called internally, which updates the session object
    expect(state.session?.transcript).toBe('New transcript');
  });
});
