import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../ui/Icon';
import { cn } from '../../../../lib/utils';
import { SessionRecord } from '../../../../services/db.service';
import { TranscriptionState } from '../../../../types';

interface SessionDetailsCardProps {
  session: SessionRecord | null;
  file: File | null;
  transcriptionState: TranscriptionState;
  isProcessing: boolean;
}

export function SessionDetailsCard({
  session,
  file,
  transcriptionState,
  isProcessing
}: SessionDetailsCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const fileName = session?.fileName || file?.name || 'Unknown File';
  const fileSize = session?.fileSize || file?.size || 0;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const fileType = session?.fileType || file?.type || 'Unknown Type';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium overflow-hidden transition-all duration-300"
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-hover/30 transition-colors focus-ring"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 text-info-muted border border-info/20 flex items-center justify-center shadow-sm">
            <Icon name="description" filled className="text-xl" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-primary tracking-tight">Session Details</h3>
            <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Metadata & Attachments</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border",
            transcriptionState.step === 'completed' ? "bg-success/10 text-success-muted border-success/20" :
            transcriptionState.step === 'error' ? "bg-error/10 text-error-muted border-error/20" :
            "bg-accent/10 text-accent-hover border-accent/20"
          )}>
            {transcriptionState.step === 'completed' && <Icon name="check_circle" filled className="text-xs" />}
            {transcriptionState.step === 'error' && <Icon name="error" filled className="text-xs" />}
            {isProcessing && <Icon name="sync" className="text-xs animate-spin" />}
            <span>{transcriptionState.step.replace('_', ' ')}</span>
          </div>
          <Icon name={isExpanded ? "expand_less" : "expand_more"} className="text-xl text-subtle" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-6 border-t border-border/30 mt-2">
              {/* File Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="space-y-1.5 p-3 rounded-2xl bg-surface-highlight/50 border border-border/40">
                  <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">File Name</p>
                  <p className="text-sm font-bold text-primary truncate" title={fileName}>{fileName}</p>
                </div>
                <div className="space-y-1.5 p-3 rounded-2xl bg-surface-highlight/50 border border-border/40">
                  <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">File Size</p>
                  <p className="text-sm font-bold text-primary">{fileSizeMB} MB</p>
                </div>
                <div className="space-y-1.5 p-3 rounded-2xl bg-surface-highlight/50 border border-border/40">
                  <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Format</p>
                  <p className="text-sm font-bold text-primary uppercase">{fileType.split('/')[1] || 'Unknown'}</p>
                </div>
                <div className="space-y-1.5 p-3 rounded-2xl bg-surface-highlight/50 border border-border/40">
                  <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-primary capitalize">{fileType.split('/')[0] || 'Media'}</p>
                </div>
              </div>

              {/* Processing Progress */}
              {isProcessing && (
                <div className="space-y-3 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-accent-hover font-bold uppercase tracking-wider">AI Processing Progress</span>
                    <span className="text-accent-hover font-mono font-bold">{transcriptionState.progress}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border/50 shadow-inner">
                    <motion.div 
                      className="bg-accent h-full rounded-full shadow-sm shadow-accent/80"
                      initial={{ width: 0 }}
                      animate={{ width: `${transcriptionState.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] text-subtle font-medium text-center italic">
                    {transcriptionState.message}
                  </p>
                </div>
              )}

              {/* Attachments Section (Placeholder for future expansion) */}
              <div className="pt-4 border-t border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Icon name="attachment" className="text-base" />
                    Attachments
                  </h4>
                  <span className="text-[10px] font-bold text-subtle bg-surface-highlight px-2 py-0.5 rounded-full border border-border/40">1 File</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-highlight/30 border border-border/20 group hover:border-accent/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-subtle group-hover:text-accent transition-colors">
                        <Icon name={fileType.startsWith('video/') ? "movie" : "audiotrack"} className="text-lg" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary truncate max-w-[150px]">{fileName}</p>
                        <p className="text-[10px] text-subtle font-medium">Primary Media • {fileSizeMB}MB</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg hover:bg-surface-highlight flex items-center justify-center text-subtle hover:text-primary transition-all">
                      <Icon name="download" className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
