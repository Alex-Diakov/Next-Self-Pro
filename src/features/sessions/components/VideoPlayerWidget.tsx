import React, { useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../../components/ui/Icon';
import { TranscriptionState } from '../../../types';
import { useSessionStore } from '../../../store/session';

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
  const seekRequest = useSessionStore(state => state.seekRequest);
  const clearSeekRequest = useSessionStore(state => state.clearSeekRequest);

  const lastUpdateTimeRef = useRef<number>(0);
  const rvfcIdRef = useRef<number>(0);

  const updateTime = useCallback(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;
    
    // Throttle updates to ~10fps to balance smooth UI and performance
    if (Math.abs(mediaEl.currentTime - lastUpdateTimeRef.current) > 0.1 || mediaEl.ended) {
      lastUpdateTimeRef.current = mediaEl.currentTime;
      React.startTransition(() => {
        setCurrentTime(mediaEl.currentTime);
      });
    }

    // Schedule next frame if it's a video and playing
    if (isVideo && videoRef.current && !videoRef.current.paused && 'requestVideoFrameCallback' in videoRef.current) {
      rvfcIdRef.current = (videoRef.current as HTMLVideoElement & { requestVideoFrameCallback: (cb: FrameRequestCallback) => number }).requestVideoFrameCallback(updateTime);
    }
  }, [setCurrentTime, videoRef, audioRef, isVideo]);

  // Sync isPlaying state to media element
  useEffect(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;

    if (isPlaying && mediaEl.paused) {
      mediaEl.play().catch(() => {});
    } else if (!isPlaying && !mediaEl.paused) {
      mediaEl.pause();
    }
  }, [isPlaying, videoRef, audioRef]);

  // Handle seek requests
  useEffect(() => {
    if (seekRequest !== null) {
      const mediaEl = videoRef.current || audioRef.current;
      if (mediaEl) {
        mediaEl.currentTime = seekRequest;
        // Force an immediate time update to keep UI in sync, especially when paused
        updateTime();
      }
      clearSeekRequest();
    }
  }, [seekRequest, clearSeekRequest, videoRef, audioRef, updateTime]);

  const updateDuration = useCallback(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (mediaEl) setDuration(mediaEl.duration);
  }, [setDuration, videoRef, audioRef]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (isVideo && videoRef.current && 'requestVideoFrameCallback' in videoRef.current) {
      rvfcIdRef.current = (videoRef.current as HTMLVideoElement & { requestVideoFrameCallback: (cb: FrameRequestCallback) => number }).requestVideoFrameCallback(updateTime);
    }
  }, [setIsPlaying, isVideo, videoRef, updateTime]);

  const handlePause = useCallback((e: Event) => {
    setIsPlaying(false);
    if (isVideo && videoRef.current && 'cancelVideoFrameCallback' in videoRef.current) {
      (videoRef.current as HTMLVideoElement & { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback(rvfcIdRef.current);
    }
    if (e.type === 'ended') {
      const mediaEl = e.target as HTMLMediaElement;
      if (mediaEl.duration && Math.abs(mediaEl.currentTime - mediaEl.duration) > 0.5) {
        setDuration(mediaEl.currentTime);
      }
    }
  }, [setIsPlaying, setDuration, isVideo, videoRef]);
  const handleError = useCallback((e: Event) => {
    const mediaEl = e.target as HTMLMediaElement;
    console.error('Media element error:', mediaEl.error);
  }, []);

  useEffect(() => {
    const mediaEl = videoRef.current || audioRef.current;
    if (!mediaEl) return;

    mediaEl.addEventListener('timeupdate', updateTime);
    mediaEl.addEventListener('loadedmetadata', updateDuration);
    mediaEl.addEventListener('durationchange', updateDuration);
    mediaEl.addEventListener('play', handlePlay);
    mediaEl.addEventListener('pause', handlePause);
    mediaEl.addEventListener('ended', handlePause);
    mediaEl.addEventListener('error', handleError);
    
    if (mediaEl.readyState >= 1) {
      setDuration(mediaEl.duration);
    }

    return () => {
      mediaEl.removeEventListener('timeupdate', updateTime);
      mediaEl.removeEventListener('loadedmetadata', updateDuration);
      mediaEl.removeEventListener('durationchange', updateDuration);
      mediaEl.removeEventListener('play', handlePlay);
      mediaEl.removeEventListener('pause', handlePause);
      mediaEl.removeEventListener('ended', handlePause);
      mediaEl.removeEventListener('error', handleError);
    };
  }, [videoUrl, isVideo, updateTime, updateDuration, handlePlay, handlePause, handleError, setDuration, videoRef, audioRef]);

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
              className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-2xl"
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
              key={videoUrl}
              ref={videoRef}
              src={videoUrl} 
              className="w-full h-full object-contain bg-black/50 rounded-[inherit]"
              preload="auto"
              playsInline
              controls
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-hover text-subtle rounded-[inherit]">
              <Icon name="play_circle" className="text-6xl mb-4 opacity-30" />
              <audio key={videoUrl} ref={audioRef} src={videoUrl} className="w-3/4" controls preload="auto" />
            </div>
          )
        ) : (transcriptionState.step === 'completed' || transcriptionState.step === 'idle') && !file ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-hover text-subtle rounded-[inherit] p-8 text-center border border-dashed border-border/50">
            <Icon name="video_file" className="text-5xl mb-4 opacity-30" />
            <span className="text-sm font-medium">No media file found for this session</span>
            <p className="text-xs opacity-60 mt-2">The original file may have been moved or deleted from your local storage.</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-hover text-subtle rounded-[inherit]">
            <Icon name="sync" className="text-4xl animate-spin mb-4 text-accent" />
            <span className="text-sm font-mono">Loading media...</span>
          </div>
        )}
      </div>
    </div>
  );
});
