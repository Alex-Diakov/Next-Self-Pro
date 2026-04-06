import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChatMessage, TranscriptionState, Project, AnalysisMarker, TranscriptLine } from '../types';
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
  summary?: string;
  transcriptLines?: TranscriptLine[];
  messages: ChatMessage[];
  status: 'processing' | 'completed' | 'error';
  transcriptionState?: TranscriptionState;
  markers?: AnalysisMarker[];
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
  files: {
    key: string;
    value: Blob;
  };
}

class DBService {
  private dbPromise: Promise<IDBPDatabase<NextSelfDB>>;

  constructor() {
    this.dbPromise = openDB<NextSelfDB>('nextself-db', 4, {
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
        if (oldVersion < 4) {
          // Version 4: Added files store for large blobs
          const filesStore = db.createObjectStore('files');
          const sessionStore = transaction.objectStore('sessions');
          
          // Migrate existing files to the new store to improve performance
          sessionStore.openCursor().then(async function migrate(cursor) {
            if (!cursor) return;
            const session = cursor.value;
            if (session.file) {
              await filesStore.put(session.file, session.id);
              delete session.file;
              await cursor.update(session);
            }
            return cursor.continue().then(migrate);
          });
          
          console.log('Upgraded database to version 4 and started file migration');
        }
      },
    });
  }

  async getAllSessions(): Promise<SessionRecord[]> {
    const db = await this.dbPromise;
    // Use getAll() instead of getAllFromIndex() to be robust against missing indexes
    const records = await db.getAll('sessions');
    console.log(`DBService: Loaded ${records.length} raw session records from IndexedDB`);
    
    // Validate and migrate records using Zod
    const validRecords: SessionRecord[] = [];
    for (const record of records) {
      const parsed = SessionRecordSchema.safeParse(record);
      if (parsed.success) {
        validRecords.push(parsed.data as SessionRecord);
      } else {
        console.warn(`DBService: Skipping invalid session record ${record.id}:`, parsed.error.format());
      }
    }
    
    // Sort manually by date descending
    const sorted = validRecords.sort((a, b) => b.date - a.date);
    console.log(`DBService: Returning ${sorted.length} valid session records`);
    return sorted;
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const db = await this.dbPromise;
    const record = await db.get('sessions', id);
    if (!record) return undefined;

    const parsed = SessionRecordSchema.safeParse(record);
    if (parsed.success) {
      const session = parsed.data as SessionRecord;
      // If the file is not in the session record, try to load it from the files store
      if (!session.file) {
        try {
          const file = await db.get('files', id);
          if (file) {
            session.file = file;
          }
        } catch (e) {
          console.error('Error loading file from files store:', e);
        }
      }
      return session;
    } else {
      console.error(`Invalid session record ${id}:`, parsed.error);
      // Fallback: return the raw record if parsing fails, to avoid losing data
      return record as SessionRecord;
    }
  }

  async saveSession(session: SessionRecord): Promise<void> {
    try {
      console.log('DBService: Saving session:', session.id, session.title);
      const db = await this.dbPromise;
      
      // Extract the file before saving to the sessions store to avoid large blob serialization issues
      const { file, ...sessionWithoutFile } = session;
      
      // Use safeParse to avoid crashing if data is invalid
      const parsedResult = SessionRecordSchema.safeParse(sessionWithoutFile);
      
      if (parsedResult.success) {
        const tx = db.transaction(['sessions', 'files'], 'readwrite');
        await tx.objectStore('sessions').put(parsedResult.data as SessionRecord);
        
        if (file) {
          await tx.objectStore('files').put(file, session.id);
          console.log('DBService: File saved for session:', session.id);
        }
        
        await tx.done;
        console.log('DBService: Session saved successfully:', session.id);
      } else {
        console.error(`DBService: Failed to validate session data for ${session.id}:`, parsedResult.error.format());
        throw new Error(`Invalid session data: ${session.id}`);
      }
    } catch (error) {
      console.error('DBService: Failed to save session:', session.id, error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please delete old sessions.');
        throw new Error('Storage quota exceeded. Please delete old sessions to free up space.', { cause: error });
      }
      throw error;
    }
  }

  async updateSession(id: string, updates: Partial<SessionRecord>): Promise<void> {
    try {
      console.log('DBService: Updating session:', id, Object.keys(updates));
      const db = await this.dbPromise;
      const tx = db.transaction(['sessions', 'files'], 'readwrite');
      const store = tx.objectStore('sessions');
      const existing = await store.get(id);
      
      if (existing) {
        const updated = { ...existing, ...updates };
        // Remove file from updated object if it exists to avoid saving it in the sessions store
        const { file, ...sessionWithoutFile } = updated as any;
        
        // Use safeParse to avoid crashing if updates are invalid
        const parsedResult = SessionRecordSchema.safeParse(sessionWithoutFile);
        if (parsedResult.success) {
          await store.put(parsedResult.data as SessionRecord);
          
          // Backward compatibility: if the file was in the sessions store, move it to the files store
          if (file && !(await tx.objectStore('files').get(id))) {
            await tx.objectStore('files').put(file, id);
          }
          console.log('DBService: Session updated successfully:', id);
        } else {
          console.error(`DBService: Failed to validate session updates for ${id}:`, parsedResult.error.format());
          throw new Error(`Invalid session data for update: ${id}`);
        }
      } else {
        console.warn(`DBService: Cannot update session ${id} - not found`);
      }
      await tx.done;
    } catch (error) {
      console.error(`DBService: Failed to update session ${id}:`, error);
      throw error;
    }
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['sessions', 'files'], 'readwrite');
    await tx.objectStore('sessions').delete(id);
    await tx.objectStore('files').delete(id);
    await tx.done;
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
