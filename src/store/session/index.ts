import { createWithEqualityFn } from 'zustand/traditional';
import { SessionStore } from './types';
import { createPlayerSlice } from './createPlayerSlice';
import { createTranscriptSlice } from './createTranscriptSlice';
import { createAnalysisSlice } from './createAnalysisSlice';
import { createCoreSlice } from './createCoreSlice';

export const useSessionStore = createWithEqualityFn<SessionStore>()((...a) => ({
  ...createPlayerSlice(...a),
  ...createTranscriptSlice(...a),
  ...createAnalysisSlice(...a),
  ...createCoreSlice(...a),
}));

export * from './types';
