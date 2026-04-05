import { SessionStateCreator, PlayerSlice } from './types';

export const createPlayerSlice: SessionStateCreator<PlayerSlice> = (set, get) => ({
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  seekRequest: null,
  setCurrentTime: (time) => {
    if (get().currentTime === time) return;
    set({ currentTime: time });
  },
  setDuration: (duration) => {
    if (get().duration === duration) return;
    set({ duration });
  },
  setIsPlaying: (isPlaying) => {
    if (get().isPlaying === isPlaying) return;
    set({ isPlaying });
  },
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  seekTo: (time) => {
    set({ seekRequest: time, currentTime: time });
  },
  clearSeekRequest: () => set({ seekRequest: null }),
});
