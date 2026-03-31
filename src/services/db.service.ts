import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChatMessage, TranscriptionState, Project } from '../types';
import { SessionRecordSchema, ProjectSchema } from '../schemas/session.schema';

export interface SessionRecord {
  id: string;
  projectId: string;
  title: string;
  date: number;
  file?: Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
  transcript: string;
  messages: ChatMessage[];
  status: 'processing' | 'completed' | 'error';
  transcriptionState?: TranscriptionState;
}

interface NextSelfDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-updated': string };
  };
  sessions: {
    key: string;
    value: SessionRecord;
    indexes: { 'by-date': number; 'by-status': string; 'by-project': string };
  };
}

class DBService {
  private dbPromise: Promise<IDBPDatabase<NextSelfDB>>;

  constructor() {
    this.dbPromise = openDB<NextSelfDB>('nextself-db', 3, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          // Version 1: Initial schema
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
        if (oldVersion < 2) {
          // Version 2: Added status index
          const store = transaction.objectStore('sessions');
          store.createIndex('by-status', 'status');
          console.log('Upgraded database to version 2');
        }
        if (oldVersion < 3) {
          // Version 3: Added projects and projectId index
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-updated', 'updatedAt');
          
          const sessionStore = transaction.objectStore('sessions');
          sessionStore.createIndex('by-project', 'projectId');
          console.log('Upgraded database to version 3');
        }
      },
    });
  }

  async getAllSessions(): Promise<SessionRecord[]> {
    const db = await this.dbPromise;
    const records = await db.getAllFromIndex('sessions', 'by-date');
    
    // Validate and migrate records using Zod
    const validRecords: SessionRecord[] = [];
    for (const record of records) {
      const parsed = SessionRecordSchema.safeParse(record);
      if (parsed.success) {
        validRecords.push(parsed.data as SessionRecord);
      } else {
        console.warn(`Skipping invalid session record ${record.id}:`, parsed.error);
      }
    }
    return validRecords;
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const db = await this.dbPromise;
    const record = await db.get('sessions', id);
    if (!record) return undefined;

    const parsed = SessionRecordSchema.safeParse(record);
    if (parsed.success) {
      return parsed.data as SessionRecord;
    } else {
      console.error(`Invalid session record ${id}:`, parsed.error);
      return undefined;
    }
  }

  async saveSession(session: SessionRecord): Promise<void> {
    try {
      const db = await this.dbPromise;
      // Ensure the data conforms to the schema before saving
      const parsed = SessionRecordSchema.parse(session);
      await db.put('sessions', parsed as SessionRecord);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please delete old sessions.');
        throw new Error('Storage quota exceeded. Please delete old sessions to free up space.');
      }
      throw error;
    }
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('sessions', id);
  }

  // Project Methods
  async getAllProjects(): Promise<Project[]> {
    const db = await this.dbPromise;
    const records = await db.getAllFromIndex('projects', 'by-updated');
    
    const validRecords: Project[] = [];
    for (const record of records) {
      const parsed = ProjectSchema.safeParse(record);
      if (parsed.success) {
        validRecords.push(parsed.data as Project);
      } else {
        console.warn(`Skipping invalid project record ${record.id}:`, parsed.error);
      }
    }
    return validRecords.reverse(); // Newest first
  }

  async getProject(id: string): Promise<Project | undefined> {
    const db = await this.dbPromise;
    const record = await db.get('projects', id);
    if (!record) return undefined;

    const parsed = ProjectSchema.safeParse(record);
    if (parsed.success) {
      return parsed.data as Project;
    } else {
      console.error(`Invalid project record ${id}:`, parsed.error);
      return undefined;
    }
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.dbPromise;
    const parsed = ProjectSchema.parse(project);
    await db.put('projects', parsed as Project);
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.dbPromise;
    // Also delete all sessions associated with this project
    const sessions = await this.getSessionsByProject(id);
    const tx = db.transaction(['projects', 'sessions'], 'readwrite');
    await tx.objectStore('projects').delete(id);
    for (const session of sessions) {
      await tx.objectStore('sessions').delete(session.id);
    }
    await tx.done;
  }

  async getSessionsByProject(projectId: string): Promise<SessionRecord[]> {
    const db = await this.dbPromise;
    const records = await db.getAllFromIndex('sessions', 'by-project', projectId);
    
    const validRecords: SessionRecord[] = [];
    for (const record of records) {
      const parsed = SessionRecordSchema.safeParse(record);
      if (parsed.success) {
        validRecords.push(parsed.data as SessionRecord);
      }
    }
    return validRecords.sort((a, b) => b.date - a.date);
  }
}

export const dbService = new DBService();
