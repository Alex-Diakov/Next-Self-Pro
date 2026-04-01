import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { dbService, SessionRecord } from './db.service';

describe('DBService', () => {
  const mockSession: SessionRecord = {
    id: 'test-123',
    projectId: 'test-project',
    title: 'Test Meeting',
    date: Date.now(),
    fileName: 'meeting.mp3',
    fileType: 'audio/mp3',
    fileSize: 1024,
    transcript: 'Hello world',
    messages: [],
    status: 'completed',
    transcriptionState: {
      step: 'completed',
      progress: 100,
      message: 'Done'
    }
  };

  beforeEach(async () => {
    // Clear all sessions before each test to ensure isolation
    const sessions = await dbService.getAllSessions();
    for (const session of sessions) {
      await dbService.deleteSession(session.id);
    }
  });

  it('should save and retrieve a session', async () => {
    await dbService.saveSession(mockSession);
    
    const retrieved = await dbService.getSession(mockSession.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(mockSession.id);
    expect(retrieved?.title).toBe(mockSession.title);
  });

  it('should return undefined for non-existent session', async () => {
    const retrieved = await dbService.getSession('non-existent');
    expect(retrieved).toBeUndefined();
  });

  it('should get all sessions', async () => {
    const mockSession2 = { ...mockSession, id: 'test-456', title: 'Second Meeting' };
    
    await dbService.saveSession(mockSession);
    await dbService.saveSession(mockSession2);
    
    const allSessions = await dbService.getAllSessions();
    expect(allSessions.length).toBe(2);
    
    // Check if both sessions are in the array
    const ids = allSessions.map(s => s.id);
    expect(ids).toContain(mockSession.id);
    expect(ids).toContain(mockSession2.id);
  });

  it('should delete a session', async () => {
    await dbService.saveSession(mockSession);
    
    // Verify it was saved
    let retrieved = await dbService.getSession(mockSession.id);
    expect(retrieved).toBeDefined();
    
    // Delete it
    await dbService.deleteSession(mockSession.id);
    
    // Verify it was deleted
    retrieved = await dbService.getSession(mockSession.id);
    expect(retrieved).toBeUndefined();
  });
});
