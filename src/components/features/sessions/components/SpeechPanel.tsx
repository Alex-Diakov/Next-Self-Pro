import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';
import { useSessionStore } from '../../../../store/session';

export const SpeechPanel = React.memo(function SpeechPanel() {
  const markers = useSessionStore(state => state.markers);
  const currentTime = useSessionStore(state => state.currentTime);
  const isAnalyzing = useSessionStore(state => state.isAnalyzing);
  const runDeepAnalysis = useSessionStore(state => state.runDeepAnalysis);
  const resetTranscription = useSessionStore(state => state.resetTranscription);

  const currentSpeech = useMemo(() => {
    return markers.filter(m => 
      m.type === 'speech' && 
      currentTime >= m.timestamp && 
      currentTime < m.timestamp + (m.duration || 1)
    );
  }, [markers, currentTime]);

  const allMetrics = useMemo(() => {
    const speechTypes = ['Stuttering', 'Rapid Speech', 'Long Pause', 'Whispering'];
    return speechTypes.map(type => {
      const active = currentSpeech.find(e => e.label === type);
      return {
        label: type,
        intensity: active ? active.intensity : 0,
        isActive: !!active
      };
    });
  }, [currentSpeech]);

  return (
    <div className="absolute inset-0 flex flex-col p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary mb-1 tracking-tight flex items-center gap-2">
            <Icon name="record_voice_over" filled className="text-accent" />
            Speech Metrics
          </h3>
          <p className="text-xs text-subtle font-mono uppercase tracking-widest opacity-60">Real-time prosodic analysis</p>
        </div>
        {isAnalyzing ? (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface text-subtle cursor-not-allowed">
              <Icon name="sync" className="animate-spin text-sm" />
              Analyzing...
            </div>
            <button 
              onClick={() => resetTranscription()}
              className="text-[9px] uppercase tracking-widest font-bold text-accent/60 hover:text-accent transition-colors pr-1"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => runDeepAnalysis('speech')}
              disabled={isAnalyzing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              )}
            >
              <Icon name="psychology" className="text-sm" />
              Run Deep Analysis
            </button>
            {useSessionStore(state => state.analysisError) && (
              <span className="text-[9px] text-error-muted font-medium max-w-[120px] text-right truncate" title={useSessionStore(state => state.analysisError) || ''}>
                Error: {useSessionStore(state => state.analysisError)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {allMetrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={cn(
                "font-bold transition-colors duration-300",
                metric.isActive ? "text-accent" : "text-subtle"
              )}>
                {metric.label}
              </span>
              <span className={cn(
                "transition-colors duration-300",
                metric.isActive ? "text-white" : "text-muted"
              )}>
                {Math.round(metric.intensity * 100)}%
              </span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-border/30">
              <motion.div 
                initial={false}
                animate={{ 
                  width: `${metric.intensity * 100}%`,
                  backgroundColor: metric.isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)'
                }}
                className="h-full rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        ))}
      </div>

      {currentSpeech.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-4 bg-accent/5 border border-accent/20 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="info" className="text-accent text-sm" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Insight</span>
          </div>
          <p className="text-sm text-secondary leading-relaxed italic">
            "{currentSpeech[0].description}"
          </p>
        </motion.div>
      )}

      {currentSpeech.length === 0 && (
        <div className="mt-10 p-8 border border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center text-center opacity-40">
          <Icon name="hourglass_empty" className="text-3xl mb-3" />
          <p className="text-xs font-mono">No active speech markers at {Math.floor(currentTime)}s</p>
        </div>
      )}
    </div>
  );
});
