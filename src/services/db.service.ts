import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChatMessage, TranscriptionState } from '../types';
import { SessionRecordSchema } from '../schemas/session.schema';

export interface SessionRecord {
  id: string;
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
  sessions: {
    key: string;
    value: SessionRecord;
    indexes: { 'by-date': number; 'by-status': string };
  };
}

class DBService {
  private dbPromise: Promise<IDBPDatabase<NextSelfDB>>;

  constructor() {
    this.dbPromise = openDB<NextSelfDB>('nextself-db', 2, {
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
}

export const dbService = new DBService();
