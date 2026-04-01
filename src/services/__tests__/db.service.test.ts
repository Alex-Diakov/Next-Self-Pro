import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { dbService, SessionRecord } from '../db.service';

describe('DBService', () => {
  beforeEach(async () => {
    // Clear the database before each test
    const projects = await dbService.getAllProjects();
    for (const p of projects) {
      await dbService.deleteProject(p.id);
    }
    const sessions = await dbService.getAllSessions();
    for (const s of sessions) {
      await dbService.deleteSession(s.id);
    }
  });

  it('should save and retrieve a project', async () => {
    const project = {
      id: 'p1',
      name: 'Test Project',
      description: 'Test Description',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbService.saveProject(project);
    const retrieved = await dbService.getProject('p1');
    
    expect(retrieved).toEqual(project);
  });

  it('should list all projects', async () => {
    const p1 = { id: 'p1', name: 'P1', status: 'active' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    const p2 = { id: 'p2', name: 'P2', status: 'active' as const, createdAt: '2024-01-02', updatedAt: '2024-01-02' };

    await dbService.saveProject(p1);
    await dbService.saveProject(p2);

    const all = await dbService.getAllProjects();
    expect(all).toHaveLength(2);
    expect(all).toContainEqual(p1);
    expect(all).toContainEqual(p2);
  });

  it('should save and retrieve a session', async () => {
    const now = Date.now();
    const session = {
      id: 's1',
      projectId: 'p1',
      title: 'Untitled Session',
      date: now,
      fileName: 'test.mp4',
      fileType: 'video/mp4',
      fileSize: 1000,
      transcript: 'Hello',
      messages: [],
      status: 'completed' as const,
      transcriptionState: { step: 'completed' as const, progress: 100, message: 'Done' },
    };

    await dbService.saveSession(session as unknown as SessionRecord);
    const retrieved = await dbService.getSession('s1');
    
    expect(retrieved).toEqual(session);
  });

  it('should get sessions by project', async () => {
    const s1 = { id: 's1', projectId: 'p1', fileName: 'f1', fileType: 'v', fileSize: 1, transcript: '', messages: [], transcriptionState: { step: 'idle' as const, progress: 0, message: '' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    const s2 = { id: 's2', projectId: 'p2', fileName: 'f2', fileType: 'v', fileSize: 1, transcript: '', messages: [], transcriptionState: { step: 'idle' as const, progress: 0, message: '' }, createdAt: '2024-01-02', updatedAt: '2024-01-02' };

    await dbService.saveSession(s1 as unknown as SessionRecord);
    await dbService.saveSession(s2 as unknown as SessionRecord);

    const p1Sessions = await dbService.getSessionsByProject('p1');
    expect(p1Sessions).toHaveLength(1);
    expect(p1Sessions[0].id).toBe('s1');
  });

  it('should delete a project', async () => {
    const p1 = { id: 'p1', name: 'P1', status: 'active' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    await dbService.saveProject(p1);
    
    await dbService.deleteProject('p1');
    const retrieved = await dbService.getProject('p1');
    expect(retrieved).toBeUndefined();
  });
});
