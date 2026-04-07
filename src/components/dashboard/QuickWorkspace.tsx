import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon';
import { Link, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/session';

export function QuickWorkspace() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setSessionFile = useSessionStore(state => state.setSessionFile);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFile = (file: File) => {
    if (file) {
      setSessionFile(file);
      navigate('/sessions/upload');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="layer-1 rounded-[2rem] p-5 lg:p-6 h-full flex flex-col relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary tracking-tight">Quick Workspace</h2>
        </div>

        <div 
          onClick={triggerUpload}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex-1 border-2 border-dashed rounded-3xl transition-all duration-500 group cursor-pointer flex flex-col items-center justify-center p-10 text-center min-h-[350px] w-full ${
            isDragging 
              ? "border-accent bg-accent/10 shadow-2xl shadow-accent/20" 
              : "border-border/40 bg-surface-tab hover:bg-surface-highlight hover:border-accent/40"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="video/*,audio/*"
          />
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-500 shadow-inner">
            <Icon name="upload_file" filled className="text-4xl text-accent-hover" />
          </div>
          
          <h3 className="text-2xl font-bold text-primary mb-2 tracking-tight">Drag & drop a session file here</h3>
          <p className="text-muted mb-8 max-w-sm text-sm font-medium leading-relaxed">
            Upload session recordings or dictate your clinical thoughts to generate structured notes.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
              className="w-full px-8 py-3.5 bg-premium-gradient text-background rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-accent/20 border-t border-border-premium flex items-center justify-center gap-2"
            >
              <Icon name="cloud_upload" className="text-xl" />
              Upload Media
            </button>
            <button className="w-full px-8 py-3.5 bg-surface-highlight text-primary rounded-xl font-bold hover:bg-surface-active active:scale-[0.98] transition-all duration-300 border border-border/40 flex items-center justify-center gap-2">
              <Icon name="mic" className="text-xl" />
              Dictate Memo
            </button>
            <button className="w-full px-8 py-3.5 bg-surface-highlight text-primary rounded-xl font-bold hover:bg-surface-active active:scale-[0.98] transition-all duration-300 border border-border/40 flex items-center justify-center gap-2">
              <Icon name="screen_record" className="text-xl" />
              Record Screen
            </button>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/patients" 
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-accent-hover hover:text-accent transition-colors flex items-center gap-1.5"
            >
              or select an existing patient
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
