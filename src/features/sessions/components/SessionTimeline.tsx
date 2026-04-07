import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { useSessionStore } from '../../../store/session';

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
    <div className="flex items-center gap-2 text-xs font-mono text-subtle whitespace-nowrap bg-background/50 px-3 py-1.5 rounded-xl border border-border/40">
      <span ref={timeRef} className="text-primary font-bold">0:00</span>
      <span className="opacity-30">/</span>
      <span className="font-bold">{formatTime(duration)}</span>
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
        className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_12px_rgba(var(--accent),0.4)]"
        style={{ width: '0%' }}
      />
    );
  }

  if (type === 'track') {
    return (
      <div 
        ref={indicatorRef}
        id={`playhead-track-${id}`}
        className="absolute top-0 bottom-0 w-px bg-accent/40 z-10 pointer-events-none"
        style={{ left: '0%' }}
      />
    );
  }

  return (
    <div 
      ref={indicatorRef}
      id={`playhead-main-${id}`}
      className={cn(
        "absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_12px_rgba(var(--accent),0.6)] z-10 pointer-events-none"
      )}
      style={{ left: `calc(0.5rem - 1px)` }}
    >
      <div className="absolute -top-1.5 -translate-x-1/2 w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/40 border-2 border-background" />
      <div className="absolute -bottom-1.5 -translate-x-1/2 w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/40 border-2 border-background" />
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
      className="h-full bg-gradient-to-r from-accent/40 via-accent to-accent/40 shadow-[0_0_20px_rgba(var(--accent),0.3)] relative overflow-hidden"
      style={{ width: '0%' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
    </div>
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
    <div className="w-full shrink-0 relative z-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-accent/5 blur-[100px] pointer-events-none z-0"></div>

      {/* Header / Collapsed View */}
      <div className="px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-12 h-12 rounded-2xl bg-accent/10 hover:bg-accent/20 flex items-center justify-center text-accent transition-all duration-300 border border-accent/20 shadow-lg shadow-accent/10 group"
          >
            <Icon name={isPlaying ? "pause" : "play_arrow"} filled className="text-3xl group-hover:scale-110 transition-transform" />
          </button>
          
          <TimeDisplay duration={duration} />
          
          {/* Progress Bar */}
          <div 
            className="flex-1 mx-4 h-3 bg-background/50 rounded-full relative overflow-hidden cursor-pointer border border-border/40 shadow-inner group/progress"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <PlayheadIndicator duration={duration} type="bar" id="header" />
            {markers.map(marker => (
              <div 
                key={marker.id}
                className={cn("absolute top-0 h-full w-1 rounded-full shadow-[0_0_8px_rgba(var(--accent),0.3)]", marker.color)}
                style={{ left: `${(marker.timestamp / (duration || 1)) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"></div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-highlight/50 rounded-xl transition-all text-subtle border border-transparent hover:border-border/40"
          >
            <Icon name={isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"} className="text-2xl" />
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
            className="border-t border-border/30 select-none relative z-10"
          >
            <div className="p-6 flex flex-col gap-8">
              {/* Controls */}
              <div className="flex items-center gap-3">
                <button 
                  className="flex items-center gap-2 bg-surface-highlight/50 hover:bg-surface-highlight text-primary px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-border/60 shadow-sm"
                >
                  <Icon name="add_location_alt" className="text-lg text-accent" />
                  Add Clinical Marker
                </button>
                <button 
                  className="flex items-center gap-2 bg-surface-highlight/50 hover:bg-surface-highlight text-primary px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-border/60 shadow-sm"
                >
                  <Icon name="data_array" className="text-lg text-info-muted" />
                  Mark Range
                </button>
              </div>

              {/* Main Track */}
              <div className="flex flex-col gap-6">
                <div 
                  className="relative w-full h-16 bg-background/40 rounded-2xl border border-border/40 flex items-center px-2 cursor-pointer group/track touch-none shadow-inner"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* Progress Fill */}
                  <div className="absolute left-0 top-0 h-full w-full px-2 pointer-events-none">
                    <div className="relative w-full h-full flex items-center">
                        <div className="w-full h-3 bg-surface-highlight/50 rounded-full overflow-hidden border border-border/20">
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
                              <div className={cn("h-8 rounded-lg opacity-40 hover:opacity-80 transition-all border border-white/20 shadow-lg", marker.color)} />
                            ) : (
                              <div className={cn("w-4 h-10 rounded-full -ml-2 shadow-xl border-2 border-background hover:scale-110 transition-transform", marker.color)} />
                            )}
                            
                            {/* Premium Tooltip */}
                            <div className={cn(
                              "absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] translate-y-2 group-hover:translate-y-0",
                              tooltipAlignClass
                            )}>
                              <div className="bg-surface/95 backdrop-blur-2xl border border-border/40 shadow-premium rounded-2xl p-4 w-72 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-3 h-3 rounded-full shadow-lg", marker.color)} />
                                  <span className="text-sm font-bold text-primary tracking-tight">{marker.label}</span>
                                  <span className="text-[10px] font-mono font-bold text-subtle ml-auto bg-background/50 px-2 py-1 rounded-lg border border-border/40">
                                    {formatTime(marker.timestamp)} {marker.endTime && `- ${formatTime(marker.endTime)}`}
                                  </span>
                                </div>
                                {marker.notes && (
                                  <p className="text-xs text-muted leading-relaxed mt-1 font-medium">{marker.notes}</p>
                                )}
                                <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-subtle uppercase tracking-widest">{marker.type}</span>
                                  <span className="text-[10px] font-bold text-accent">Click to seek</span>
                                </div>
                              </div>
                              <div className={cn("absolute top-full -mt-1.5 border-[6px] border-transparent border-t-surface/95", arrowAlignClass)} />
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
                <div className="space-y-4 px-2">
                  {/* Emotions Track */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 shrink-0 flex flex-col">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Emotions</span>
                      <span className="text-[9px] text-subtle font-medium">Intensity</span>
                    </div>
                    <div className="flex-1 h-4 bg-background/30 rounded-xl relative border border-border/20 overflow-hidden shadow-inner">
                      {storeMarkers.filter(m => m.type === 'emotion').map(m => {
                        const leftPercent = (m.timestamp / (duration || 1)) * 100;
                        return (
                          <div 
                            key={m.id}
                            className="absolute top-0 h-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)] group/marker cursor-help"
                            style={{ 
                              left: `${leftPercent}%`, 
                              width: `${((m.duration || 1) / (duration || 1)) * 100}%`,
                              opacity: 0.15 + (m.intensity * 0.85)
                            }}
                          />
                        );
                      })}
                      <PlayheadIndicator duration={duration} type="track" id="emotions" />
                    </div>
                  </div>

                  {/* Speech Track */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 shrink-0 flex flex-col">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Speech</span>
                      <span className="text-[9px] text-subtle font-medium">Activity</span>
                    </div>
                    <div className="flex-1 h-4 bg-background/30 rounded-xl relative border border-border/20 overflow-hidden shadow-inner">
                      {storeMarkers.filter(m => m.type === 'speech').map(m => {
                        const leftPercent = (m.timestamp / (duration || 1)) * 100;
                        return (
                          <div 
                            key={m.id}
                            className="absolute top-0 h-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)] group/marker cursor-help"
                            style={{ 
                              left: `${leftPercent}%`, 
                              width: `${((m.duration || 1) / (duration || 1)) * 100}%`,
                              opacity: 0.15 + (m.intensity * 0.85)
                            }}
                          />
                        );
                      })}
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

