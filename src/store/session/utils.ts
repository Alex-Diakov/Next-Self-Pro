import { dbService, SessionRecord } from '../../services/db.service';
import { SessionStore } from './types';

let saveQueue = Promise.resolve();

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
};

export const saveToDb = (
  get: () => SessionStore,
  set: (partial: Partial<SessionStore> | ((state: SessionStore) => Partial<SessionStore>)) => void,
  sessionId: string,
  updates: Partial<SessionRecord>
) => {
  const { session } = get();
  
  if (session && session.id === sessionId) {
    // Check if any value in updates is different from current session
    const hasChanges = Object.entries(updates).some(([key, value]) => {
      return session[key as keyof SessionRecord] !== value;
    });

    if (hasChanges) {
      set({ session: { ...session, ...updates } });
    }
  }

  saveQueue = saveQueue.then(async () => {
    await dbService.updateSession(sessionId, updates);
  }).catch(console.error);
};

export const queueSave = (promiseFn: () => Promise<void>) => {
  saveQueue = saveQueue.then(promiseFn).catch(console.error);
};
