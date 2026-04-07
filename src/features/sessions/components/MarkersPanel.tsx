import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { SessionMarker } from '../../../types';

interface MarkersPanelProps {
  markers: SessionMarker[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onAddMarker: () => void;
}

export function MarkersPanel({ markers, currentTime, onSeek, onAddMarker }: MarkersPanelProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex flex-col p-5 lg:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Session Markers</h3>
        <button 
          onClick={onAddMarker}
          className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent-hover px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-accent/20 focus-ring"
        >
          <Icon name="add_location_alt" className="text-sm" />
          Add Marker
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {markers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-subtle opacity-40">
            <Icon name="bookmark_border" className="text-4xl mb-2" />
            <span className="text-xs font-mono">No markers added yet</span>
          </div>
        ) : (
          markers
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((marker) => {
              const isActive = Math.abs(currentTime - marker.timestamp) < 2;
              
              return (
                <button
                  key={marker.id}
                  onClick={() => onSeek(marker.timestamp)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 group text-left",
                    isActive 
                      ? "bg-accent/10 border-accent/30 shadow-lg shadow-accent/10 scale-[1.02]" 
                      : "bg-surface-highlight/50 border-border hover:border-border-hover hover:bg-surface-highlight"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner",
                    marker.color.replace('bg-', 'bg-opacity-20 text-').replace('text-', 'text-opacity-100 ')
                  )}>
                    <Icon name="location_on" className="text-lg" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-secondary uppercase tracking-tight">
                        {marker.label}
                      </span>
                      <span className="text-[10px] font-mono text-subtle bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
                        {formatTime(marker.timestamp)}
                      </span>
                    </div>
                    {marker.notes && (
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {marker.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className={cn(
                    "self-center opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive ? "text-accent" : "text-subtle"
                  )}>
                    <Icon name="play_circle" className="text-xl" />
                  </div>
                </button>
              );
            })
        )}
      </div>
    </div>
  );
}
