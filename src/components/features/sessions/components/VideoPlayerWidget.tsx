import React, { useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../../../components/ui/Icon';
import { TranscriptionState } from '../../../../types';
import { useSessionStore } from '../../../../store/session';

interface VideoPlayerWidgetProps {
  videoUrl: string | null;
  isVideo: boolean;
  isProcessing: boolean;
  transcriptionState: TranscriptionState;
  file: File | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const VideoPlayerWidget = React.memo(function VideoPlayerWidget({
  videoUrl,
  isVideo,
  isProcessing,
  transcriptionState,
  file,
  videoRef,
  audioRef
}: VideoPlayerWidgetProps) {
  const isPlaying = useSessionStore(state => state.isPlaying);
  const togglePlay = useSessionStore(state => state.togglePlay);
  const setCurrentTime = useSessionStore(state => state.setCurrentTime);
  const setDuration = useSessionStore(state => state.setDuration);
  const setIsPlaying = useSessionStore(state => state.setIsPlaying);

  const updateTime = useCallback(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (mediaEl) setCurrentTime(mediaEl.currentTime);
  }, [setCurrentTime, videoRef, audioRef]);

  const updateDuration = useCallback(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (mediaEl) setDuration(mediaEl.duration);
  }, [setDuration, videoRef, audioRef]);

  const handlePlay = useCallback(() => setIsPlaying(true), [setIsPlaying]);
  const handlePause = useCallback(() => setIsPlaying(false), [setIsPlaying]);

  useEffect(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;

    mediaEl.addEventListener('timeupdate', updateTime);
    mediaEl.addEventListener('loadedmetadata', updateDuration);
    mediaEl.addEventListener('play', handlePlay);
    mediaEl.addEventListener('pause', handlePause);
    
    if (mediaEl.readyState >= 1) {
      setDuration(mediaEl.duration);
    }

    return () => {
      mediaEl.removeEventListener('timeupdate', updateTime);
      mediaEl.removeEventListener('loadedmetadata', updateDuration);
      mediaEl.removeEventListener('play', handlePlay);
      mediaEl.removeEventListener('pause', handlePause);
    };
  }, [videoUrl, isVideo, updateTime, updateDuration, handlePlay, handlePause, setDuration, videoRef, audioRef]);

  return (
    <div className="w-full flex flex-col shrink-0">
      <div className="bg-background rounded-[32px] overflow-hidden shadow-premium aspect-video relative flex items-center justify-center border border-border border-t-border-glass group">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Play/Pause Overlay on Hover */}
        {videoUrl && !isProcessing && (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 cursor-pointer"
            onClick={togglePlay}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl"
            >
              <Icon name={isPlaying ? "pause" : "play_arrow"} className="text-4xl" />
            </motion.div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[32px]">
            <div className="w-full h-full bg-accent/5 animate-scanline border-b border-accent/20 shadow-md shadow-accent/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
          </div>
        )}
        {videoUrl ? (
          isVideo ? (
            <video 
              ref={videoRef}
              src={videoUrl} 
              className="w-full h-full object-contain bg-black/50 rounded-xl"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-subtle">
              <Icon name="play_circle" className="text-6xl mb-4 opacity-30" />
              <audio ref={audioRef} src={videoUrl} className="w-3/4" />
            </div>
          )
        ) : transcriptionState.step === 'completed' && !file ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-subtle">
            <Icon name="error" filled className="text-5xl mb-4 opacity-30 text-error" />
            <span className="text-sm font-mono">No media file found for this session</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-subtle">
            <Icon name="sync" className="text-4xl animate-spin mb-4 text-accent" />
            <span className="text-sm font-mono">Loading media...</span>
          </div>
        )}
      </div>
    </div>
  );
});
