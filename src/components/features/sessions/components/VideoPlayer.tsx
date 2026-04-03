import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import 'videojs-markers-plugin/dist/videojs.markers.plugin.css';
import 'videojs-markers-plugin';

interface VideoPlayerProps {
  options: any;
  onReady?: (player: Player) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  markers?: any[];
  className?: string;
}

export const VideoPlayer = (props: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const markersInitializedRef = useRef(false);
  const { options, onReady, onTimeUpdate, onPlay, onPause, markers, className } = props;

  const initMarkers = (player: any, markerList: any[]) => {
    if (!player || typeof player.markers !== 'function') return;
    
    try {
      player.markers({
        markers: markerList || [],
        markerStyle: {
          'width': '8px',
          'height': '8px',
          'background-color': '#3b82f6',
          'border-radius': '50%',
          'bottom': '30%'
        }
      });
      markersInitializedRef.current = true;
    } catch (e) {
      console.error('Failed to initialize videojs-markers:', e);
    }
  };

  const updateMarkers = (player: any, markerList: any[]) => {
    if (!player || !player.markers) return;

    try {
      const markersApi = player.markers;
      if (typeof markersApi.reset === 'function') {
        markersApi.reset(markerList || []);
      } else if (typeof markersApi.removeAll === 'function' && typeof markersApi.add === 'function') {
        markersApi.removeAll();
        markersApi.add(markerList || []);
      } else if (typeof markersApi === 'function') {
        // If it's still a function, it means it wasn't initialized
        initMarkers(player, markerList);
      }
    } catch (e) {
      console.warn('Failed to update videojs-markers:', e);
    }
  };

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = document.createElement("video");
      videoElement.className = 'video-js vjs-big-play-centered';
      videoRef.current?.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        console.log('Video.js player is ready');
        
        // Initialize markers if we have them or just to prepare the API
        if (!markersInitializedRef.current) {
          initMarkers(player, markers || []);
        }
        
        onReady && onReady(player);
      });

      // Event listeners
      player.on('timeupdate', () => {
        onTimeUpdate && onTimeUpdate(player.currentTime() || 0);
      });

      player.on('play', () => {
        onPlay && onPlay();
      });

      player.on('pause', () => {
        onPause && onPause();
      });

    } else {
      const player = playerRef.current;

      // Update source if changed
      if (options.sources && options.sources.length > 0) {
        const currentSrc = player.currentSrc();
        const newSrc = options.sources[0].src;
        if (currentSrc !== newSrc) {
          player.src(options.sources);
        }
      }
      
      player.autoplay(options.autoplay);
      
      // Update markers
      if (markersInitializedRef.current) {
        updateMarkers(player, markers || []);
      } else {
        initMarkers(player, markers || []);
      }
    }
  }, [options, markers]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className={className}>
      <div ref={videoRef} />
    </div>
  );
}

export default VideoPlayer;
