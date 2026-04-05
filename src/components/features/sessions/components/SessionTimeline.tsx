import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';
import { useSessionStore } from '../../../../store/session';
import { AnalysisMarker } from '../../../../types';

export type MarkerLabel = 'Insight' | 'Emotion' | 'Resistance' | 'Breakthrough' | 'Other';

export interface SessionMarker {
  id: string;
  timestamp: number;
  endTime?: number;
  label: string;
  color: string;
  notes?: string;
  type: 'emotion' | 'speech' | 'insight';
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const TimeDisplay = React.memo(({ duration }: { duration: number }) => {
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (timeRef.current) {
      timeRef.current.textContent = formatTime(useSessionStore.getState().currentTime);
    }
    return useSessionStore.subscribe(
      (state, prevState) => {
        if (state.currentTime !== prevState.currentTime && timeRef.current) {
          timeRef.current.textContent = formatTime(state.currentTime);
        }
      }
    );
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-subtle whitespace-nowrap">
      <span ref={timeRef}>0:00</span>
      <span>/</span>
      <span>{formatTime(duration)}</span>
    </div>
  );
});

const PlayheadIndicator = React.memo(({ duration, type, id }: { duration: number, type: 'main' | 'track' | 'bar', id: string }) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateIndicator = (currentTime: number) => {
      if (indicatorRef.current && duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        if (type === 'bar') {
          indicatorRef.current.style.width = `${progressPercent}%`;
        } else if (type === 'track') {
          indicatorRef.current.style.left = `${progressPercent}%`;
        } else {
          indicatorRef.current.style.left = `calc(0.5rem + ${progressPercent}% - 1px)`;
        }
      }
    };

    updateIndicator(useSessionStore.getState().currentTime);

    return useSessionStore.subscribe(
      (state, prevState) => {
        if (state.currentTime !== prevState.currentTime) {
          updateIndicator(state.currentTime);
        }
      }
    );
  }, [duration, type]);

  if (type === 'bar') {
    return (
      <div 
        ref={indicatorRef}
        id={`playhead-bar-${id}`}
        className="absolute top-0 left-0 h-full bg-accent"
        style={{ width: '0%' }}
      />
    );
  }

  if (type === 'track') {
    return (
      <div 
        ref={indicatorRef}
        id={`playhead-track-${id}`}
        className="absolute top-0 bottom-0 w-px bg-white/40 z-10 pointer-events-none"
        style={{ left: '0%' }}
      />
    );
  }

  return (
    <div 
      ref={indicatorRef}
      id={`playhead-main-${id}`}
      className={cn(
        "absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_8px_rgba(var(--accent),0.8)] z-10 pointer-events-none"
      )}
      style={{ left: `calc(0.5rem - 1px)` }}
    >
      <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-accent rounded-full shadow-sm shadow-accent/50" />
    </div>
  );
});

const ProgressFill = React.memo(({ duration }: { duration: number }) => {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateFill = (currentTime: number) => {
      if (fillRef.current && duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        fillRef.current.style.width = `${progressPercent}%`;
      }
    };

    updateFill(useSessionStore.getState().currentTime);

    return useSessionStore.subscribe(
      (state, prevState) => {
        if (state.currentTime !== prevState.currentTime) {
          updateFill(state.currentTime);
        }
      }
    );
  }, [duration]);

  return (
    <div 
      ref={fillRef}
      className="h-full bg-accent/50"
      style={{ width: '0%' }}
    />
  );
});

export const SessionTimeline = React.memo(function SessionTimeline() {
  const duration = useSessionStore(state => state.duration);
  const isPlaying = useSessionStore(state => state.isPlaying);
  const seekTo = useSessionStore(state => state.seekTo);
  const togglePlay = useSessionStore(state => state.togglePlay);
  const storeMarkers = useSessionStore(state => state.markers);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const markers = useMemo(() => {
    return storeMarkers.map(m => ({
      id: m.id,
      timestamp: m.timestamp,
      endTime: m.duration ? m.timestamp + m.duration : undefined,
      label: m.label,
      color: m.type === 'emotion' ? 'bg-purple-500' : m.type === 'insight' ? 'bg-blue-500' : 'bg-orange-500',
      notes: m.description,
      type: m.type
    }));
  }, [storeMarkers]);

  const handleAddMarker = () => {
    // This will be implemented in the next phase
  };

  const handleSeekTo = (seconds: number) => {
    seekTo(Math.max(0, Math.min(duration, seconds)));
  };

  const handleTrackInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left - 8; // 8px padding
    const width = rect.width - 16; // 16px total padding
    const percent = Math.max(0, Math.min(1, x / width));
    handleSeekTo(percent * duration);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    handleTrackInteraction(e as any);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleTrackInteraction(e as any);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  return (
    <div className="w-full shrink-0 bg-surface rounded-[2rem] border border-border-glass transition-all duration-300 shadow-premium relative z-10">
      {/* Header / Collapsed View */}
      <div 
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors"
      >
        <div className="flex items-center gap-3 w-full">
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-10 h-10 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center text-accent transition-colors focus-ring"
          >
            <Icon name={isPlaying ? "pause" : "play_arrow"} className="text-2xl" />
          </button>
          
          <TimeDisplay duration={duration} />
          
          {/* Progress Bar */}
          <div 
            className="flex-1 mx-2 h-2 bg-background rounded-full relative overflow-hidden cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <PlayheadIndicator duration={duration} type="bar" id="header" />
            {markers.map(marker => (
              <div 
                key={marker.id}
                className={cn("absolute top-0 h-full w-1 rounded-full", marker.color)}
                style={{ left: `${(marker.timestamp / (duration || 1)) * 100}%` }}
              />
            ))}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors text-subtle"
          >
            <Icon name={isExpanded ? "expand_less" : "expand_more"} />
          </button>
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/30 select-none relative"
          >
            <div className="p-4 flex flex-col gap-6">
              {/* Controls */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAddMarker(); }}
                  className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent-hover px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-accent/20 focus-ring"
                >
                  <Icon name="add_location_alt" className="text-lg" />
                  Add Instant Marker
                </button>
                <button 
                  className="flex items-center gap-2 bg-surface hover:bg-surface-hover text-secondary px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-border focus-ring"
                >
                  <Icon name="data_array" className="text-lg" />
                  Add Range
                </button>
              </div>

              {/* Main Track */}
              <div className="flex flex-col gap-4">
                <div 
                  className="relative w-full h-12 bg-background/50 rounded-xl border border-border/50 flex items-center px-2 cursor-pointer group/track touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* Progress Fill */}
                  <div className="absolute left-0 top-0 h-full w-full px-2 pointer-events-none">
                    <div className="relative w-full h-full flex items-center">
                        <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                          <ProgressFill duration={duration} />
                        </div>
                    </div>
                  </div>

                  {/* Markers */}
                  <div className="absolute left-0 top-0 w-full h-full px-2 pointer-events-none">
                    <div className="relative w-full h-full">
                      {markers.map(marker => {
                        const leftPercent = (marker.timestamp / (duration || 1)) * 100;
                        const widthPercent = marker.endTime ? ((marker.endTime - marker.timestamp) / (duration || 1)) * 100 : 0;
                        
                        // Smart tooltip alignment to prevent edge clipping
                        const tooltipAlignClass = leftPercent < 20 ? 'left-0 translate-x-0' : leftPercent > 80 ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2';
                        const arrowAlignClass = leftPercent < 20 ? 'left-4 translate-x-0' : leftPercent > 80 ? 'right-4 translate-x-0' : 'left-1/2 -translate-x-1/2';

                        return (
                          <div 
                            key={marker.id}
                            className="absolute top-1/2 -translate-y-1/2 group cursor-pointer pointer-events-auto z-20"
                            style={{ left: `${leftPercent}%`, width: marker.endTime ? `${widthPercent}%` : 'auto' }}
                            onClick={(e) => { e.stopPropagation(); seekTo(marker.timestamp); }}
                          >
                            {marker.endTime ? (
                              // Range Marker
                              <div className={cn("h-6 rounded-md opacity-40 hover:opacity-80 transition-opacity border border-white/20", marker.color)} />
                            ) : (
                              // Point Marker
                              <div className={cn("w-3 h-8 rounded-full -ml-1.5 shadow-md border border-white/20 hover:scale-110 transition-transform", marker.color)} />
                            )}
                            
                            {/* Premium Tooltip */}
                            <div className={cn(
                              "absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] translate-y-2 group-hover:translate-y-0",
                              tooltipAlignClass
                            )}>
                              <div className="bg-surface-hover/95 backdrop-blur-xl border border-border-glass shadow-premium rounded-xl p-3 w-64 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", marker.color)} />
                                  <span className="text-xs font-bold text-secondary">{marker.label}</span>
                                  <span className="text-[10px] font-mono text-subtle ml-auto bg-background/50 px-1.5 py-0.5 rounded-md border border-border/50">
                                    {formatTime(marker.timestamp)} {marker.endTime && `- ${formatTime(marker.endTime)}`}
                                  </span>
                                </div>
                                {marker.notes && (
                                  <p className="text-xs text-muted leading-relaxed mt-1 whitespace-normal break-words">{marker.notes}</p>
                                )}
                              </div>
                              {/* Tooltip Arrow */}
                              <div className={cn("absolute top-full -mt-1 border-4 border-transparent border-t-surface-hover/95", arrowAlignClass)} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Playhead */}
                  <PlayheadIndicator duration={duration} type="main" id="main" />
                </div>

                {/* Analysis Tracks (Heatmaps) */}
                <div className="space-y-2 px-2">
                  {/* Emotions Track */}
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[10px] font-mono font-bold text-subtle uppercase tracking-widest">Emotions</span>
                    <div className="flex-1 h-3 bg-background/30 rounded-full relative border border-border/20">
                      {storeMarkers.filter(m => m.type === 'emotion').map(m => {
                        const leftPercent = (m.timestamp / (duration || 1)) * 100;
                        const tooltipAlignClass = leftPercent < 20 ? 'left-0 translate-x-0' : leftPercent > 80 ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2';
                        const arrowAlignClass = leftPercent < 20 ? 'left-4 translate-x-0' : leftPercent > 80 ? 'right-4 translate-x-0' : 'left-1/2 -translate-x-1/2';

                        return (
                          <div 
                            key={m.id}
                            className="absolute top-0 h-full bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.4)] group/marker cursor-help"
                            style={{ 
                              left: `${leftPercent}%`, 
                              width: `${((m.duration || 1) / (duration || 1)) * 100}%`,
                              opacity: 0.2 + (m.intensity * 0.8)
                            }}
                          >
                            {/* Heatmap Tooltip */}
                            <div className={cn(
                              "absolute bottom-full mb-2 opacity-0 group-hover/marker:opacity-100 transition-all duration-200 pointer-events-none z-[110] translate-y-2 group-hover/marker:translate-y-0",
                              tooltipAlignClass
                            )}>
                              <div className="bg-surface-hover/95 backdrop-blur-xl border border-border-glass shadow-premium rounded-xl p-2 w-48 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                                  <span className="text-[10px] font-bold text-secondary">{m.label}</span>
                                  <span className="text-[9px] font-mono text-subtle ml-auto">{Math.round(m.intensity * 100)}%</span>
                                </div>
                                {m.description && <p className="text-[9px] text-muted leading-tight line-clamp-2">{m.description}</p>}
                              </div>
                              <div className={cn("absolute top-full -mt-1 border-4 border-transparent border-t-surface-hover/95", arrowAlignClass)} />
                            </div>
                          </div>
                        );
                      })}
                      {/* Playhead indicator on track */}
                      <PlayheadIndicator duration={duration} type="track" id="emotions" />
                    </div>
                  </div>

                  {/* Speech Track */}
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[10px] font-mono font-bold text-subtle uppercase tracking-widest">Speech</span>
                    <div className="flex-1 h-3 bg-background/30 rounded-full relative border border-border/20">
                      {storeMarkers.filter(m => m.type === 'speech').map(m => {
                        const leftPercent = (m.timestamp / (duration || 1)) * 100;
                        const tooltipAlignClass = leftPercent < 20 ? 'left-0 translate-x-0' : leftPercent > 80 ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2';
                        const arrowAlignClass = leftPercent < 20 ? 'left-4 translate-x-0' : leftPercent > 80 ? 'right-4 translate-x-0' : 'left-1/2 -translate-x-1/2';

                        return (
                          <div 
                            key={m.id}
                            className="absolute top-0 h-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.4)] group/marker cursor-help"
                            style={{ 
                              left: `${leftPercent}%`, 
                              width: `${((m.duration || 1) / (duration || 1)) * 100}%`,
                              opacity: 0.2 + (m.intensity * 0.8)
                            }}
                          >
                            {/* Heatmap Tooltip */}
                            <div className={cn(
                              "absolute bottom-full mb-2 opacity-0 group-hover/marker:opacity-100 transition-all duration-200 pointer-events-none z-[110] translate-y-2 group-hover/marker:translate-y-0",
                              tooltipAlignClass
                            )}>
                              <div className="bg-surface-hover/95 backdrop-blur-xl border border-border-glass shadow-premium rounded-xl p-2 w-48 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                                  <span className="text-[10px] font-bold text-secondary">{m.label}</span>
                                  <span className="text-[9px] font-mono text-subtle ml-auto">{Math.round(m.intensity * 100)}%</span>
                                </div>
                                {m.description && <p className="text-[9px] text-muted leading-tight line-clamp-2">{m.description}</p>}
                              </div>
                              <div className={cn("absolute top-full -mt-1 border-4 border-transparent border-t-surface-hover/95", arrowAlignClass)} />
                            </div>
                          </div>
                        );
                      })}
                      {/* Playhead indicator on track */}
                      <PlayheadIndicator duration={duration} type="track" id="speech" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
