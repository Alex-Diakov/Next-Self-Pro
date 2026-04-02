import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';

export type MarkerLabel = 'Insight' | 'Emotion' | 'Resistance' | 'Breakthrough' | 'Other';

export interface SessionMarker {
  id: string;
  timestamp: number;
  endTime?: number;
  label: MarkerLabel;
  color: string;
  notes?: string;
}

const MOCK_MARKERS: SessionMarker[] = [
  { id: '1', timestamp: 45, label: 'Insight', color: 'bg-blue-500', notes: 'Patient realized the connection between past events and current anxiety.' },
  { id: '2', timestamp: 120, endTime: 150, label: 'Emotion', color: 'bg-purple-500', notes: 'Strong emotional response when discussing family dynamics.' },
  { id: '3', timestamp: 210, label: 'Resistance', color: 'bg-orange-500', notes: 'Avoided answering the direct question about recent conflicts.' }
];

interface SessionTimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export function SessionTimeline({ currentTime, duration, onSeek }: SessionTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [markers, setMarkers] = useState<SessionMarker[]>(MOCK_MARKERS);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleAddMarker = () => {
    const newMarker: SessionMarker = {
      id: Date.now().toString(),
      timestamp: currentTime,
      label: 'Insight',
      color: 'bg-blue-500',
      notes: 'New instant marker added during playback.'
    };
    setMarkers([...markers, newMarker]);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full shrink-0 bg-surface rounded-[2rem] border border-border-glass overflow-hidden transition-all duration-300 shadow-premium">
      {/* Header / Collapsed View */}
      <div 
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 w-full">
          <Icon name="timeline" className="text-accent text-xl" />
          <span className="font-bold text-sm text-secondary whitespace-nowrap">Session Timeline</span>
          
          {/* Mini Progress Bar (visible when collapsed) */}
          {!isExpanded && (
            <div className="flex-1 mx-4 h-1.5 bg-background rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-accent transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              {markers.map(marker => (
                <div 
                  key={marker.id}
                  className={cn("absolute top-0 h-full w-1 rounded-full", marker.color)}
                  style={{ left: `${(marker.timestamp / (duration || 1)) * 100}%` }}
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs font-mono text-subtle whitespace-nowrap ml-auto">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <Icon name={isExpanded ? "expand_less" : "expand_more"} className="text-subtle ml-2" />
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30"
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
              <div className="relative w-full h-12 bg-background/50 rounded-xl border border-border/50 flex items-center px-2">
                {/* Progress Fill */}
                <div className="absolute left-0 top-0 h-full w-full px-2 pointer-events-none">
                   <div className="relative w-full h-full flex items-center">
                      <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent/50 transition-all duration-100"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                   </div>
                </div>

                {/* Markers */}
                <div className="absolute left-0 top-0 w-full h-full px-2">
                  <div className="relative w-full h-full">
                    {markers.map(marker => {
                      const leftPercent = (marker.timestamp / (duration || 1)) * 100;
                      const widthPercent = marker.endTime ? ((marker.endTime - marker.timestamp) / (duration || 1)) * 100 : 0;
                      
                      return (
                        <div 
                          key={marker.id}
                          className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                          style={{ left: `${leftPercent}%`, width: marker.endTime ? `${widthPercent}%` : 'auto' }}
                          onClick={(e) => { e.stopPropagation(); onSeek(marker.timestamp); }}
                        >
                          {marker.endTime ? (
                            // Range Marker
                            <div className={cn("h-6 rounded-md opacity-40 hover:opacity-80 transition-opacity border border-white/20", marker.color)} />
                          ) : (
                            // Point Marker
                            <div className={cn("w-3 h-8 rounded-full -ml-1.5 shadow-md border border-white/20 hover:scale-110 transition-transform", marker.color)} />
                          )}
                          
                          {/* Premium Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-surface-hover/95 backdrop-blur-xl border border-border-glass shadow-premium rounded-xl p-3 w-56 flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", marker.color)} />
                                <span className="text-xs font-bold text-secondary">{marker.label}</span>
                                <span className="text-[10px] font-mono text-subtle ml-auto bg-background/50 px-1.5 py-0.5 rounded-md border border-border/50">
                                  {formatTime(marker.timestamp)} {marker.endTime && `- ${formatTime(marker.endTime)}`}
                                </span>
                              </div>
                              {marker.notes && (
                                <p className="text-xs text-muted leading-relaxed mt-1">{marker.notes}</p>
                              )}
                            </div>
                            {/* Tooltip Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-surface-hover/95" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Playhead */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_8px_rgba(var(--accent),0.8)] z-10 pointer-events-none transition-all duration-100"
                  style={{ left: `calc(0.5rem + ${progressPercent}% - 1px)` }}
                >
                  <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-accent rounded-full shadow-sm shadow-accent/50" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
