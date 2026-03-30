import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { FileText, Sparkles, Send, Loader2, ArrowLeft, PlayCircle, CheckCircle2, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useSessionStore } from '../../../store/useSessionStore';

interface SessionViewProps {
  file: File | null;
  sessionId: string | null;
  onBack: () => void;
}

type Tab = 'transcript' | 'analysis';

export function SessionView({ file, sessionId, onBack }: SessionViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('transcript');
  const [inputMessage, setInputMessage] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const processedFileRef = useRef<File | null>(null);

  const { 
    transcript, 
    transcriptionState, 
    messages, 
    isAnalyzing, 
    session,
    sessionFile,
    sendMessage,
    updateTranscript,
    loadSession,
    processFile
  } = useSessionStore();

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    } else if (file && processedFileRef.current !== file) {
      processedFileRef.current = file;
      processFile(file);
    }
  }, [sessionId, file, loadSession, processFile]);

  useEffect(() => {
    if (sessionFile) {
      const url = URL.createObjectURL(sessionFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [sessionFile]);

  useEffect(() => {
    if (activeTab === 'analysis') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAnalyzing || !transcript) return;
    
    const msg = inputMessage;
    setInputMessage('');
    await sendMessage(msg);
  };

  const handleSaveTranscript = () => {
    updateTranscript(editedTranscript);
    setIsEditingTranscript(false);
  };

  const handleStartEdit = () => {
    setEditedTranscript(transcript);
    setIsEditingTranscript(true);
  };

  const isProcessing = transcriptionState.step !== 'completed' && transcriptionState.step !== 'error' && transcriptionState.step !== 'idle';
  const isVideo = sessionFile?.type.startsWith('video/') || session?.fileType.startsWith('video/');

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column: Media Player */}
      <div className="w-full lg:w-5/12 flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </button>
        
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center border border-slate-800">
          {isProcessing && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-3xl">
              <div className="w-full h-full bg-primary-500/5 animate-scanline border-b border-primary-500/20 shadow-[0_4px_15px_rgba(208,150,59,0.1)]"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
            </div>
          )}
          {videoUrl ? (
            isVideo ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <PlayCircle className="w-16 h-16 mb-4 opacity-30" />
                <audio src={videoUrl} controls className="w-3/4" />
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
              <span className="text-sm font-mono">Loading media...</span>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <h3 className="font-medium text-slate-200 mb-4 font-serif">Session Details</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">File Name</span>
              <span className="font-medium text-slate-300 truncate max-w-[200px] font-mono text-xs">{session?.fileName || file?.name || 'Loading...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">File Size</span>
              <span className="font-medium text-slate-300 font-mono text-xs">
                {session?.fileSize ? (session.fileSize / (1024 * 1024)).toFixed(2) : file ? (file.size / (1024 * 1024)).toFixed(2) : '0'} MB
              </span>
            </div>
            
            {/* Progress Indicator */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500">Status</span>
                <span className={cn(
                  "font-medium flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
                  transcriptionState.step === 'completed' ? "bg-emerald-900/20 text-emerald-400 border-emerald-800/50" :
                  transcriptionState.step === 'error' ? "bg-red-900/20 text-red-400 border-red-800/50" :
                  "bg-primary-900/20 text-primary-400 border-primary-800/50"
                )}>
                  {transcriptionState.step === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {transcriptionState.step === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {transcriptionState.message}
                </span>
              </div>
              
              {isProcessing && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <motion.div 
                    className="bg-primary-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(208,150,59,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${transcriptionState.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Workspace */}
      <div className="w-full lg:w-7/12 flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
        {/* Tabs */}
        <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-900/50">
          <div className="flex bg-slate-950 p-1 rounded-2xl w-full max-w-md border border-slate-800">
            <button
              onClick={() => setActiveTab('transcript')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all focus-ring",
                activeTab === 'transcript' 
                  ? "bg-slate-800 text-slate-200 shadow-sm border border-slate-700/50" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <FileText className="w-4 h-4" />
              Transcription
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={isProcessing || transcriptionState.step === 'error'}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all focus-ring",
                activeTab === 'analysis' 
                  ? "bg-slate-800 text-primary-400 shadow-sm border border-slate-700/50" 
                  : "text-slate-500 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI Analysis
            </button>
          </div>
          
          {activeTab === 'transcript' && transcriptionState.step === 'completed' && !isEditingTranscript && (
            <button 
              onClick={handleStartEdit}
              className="mr-2 flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 focus-ring"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
          {activeTab === 'transcript' && isEditingTranscript && (
            <div className="flex items-center gap-2 mr-2">
              <button 
                onClick={() => setIsEditingTranscript(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 focus-ring"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={handleSaveTranscript}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-900 bg-primary-500 hover:bg-primary-400 transition-colors px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(208,150,59,0.3)] focus-ring"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'transcript' && (
            <div className="absolute inset-0 overflow-auto p-6 lg:p-8 custom-scrollbar">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6 max-w-sm mx-auto text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin absolute inset-0 shadow-[0_0_15px_rgba(208,150,59,0.2)]"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-200 mb-1 font-serif">Processing Session</h4>
                    <p className="text-sm text-slate-400 font-mono">{transcriptionState.message}</p>
                  </div>
                  
                  {/* Granular Progress Steps */}
                  <div className="w-full space-y-3 mt-4 text-left">
                    {[
                      { id: 'uploading', label: 'Uploading securely' },
                      { id: 'extracting_audio', label: 'Extracting audio track' },
                      { id: 'processing_ai', label: 'AI transcription & diarization' }
                    ].map((step, idx) => {
                      const steps = ['idle', 'uploading', 'extracting_audio', 'processing_ai', 'completed'];
                      const currentStepIndex = steps.indexOf(transcriptionState.step);
                      const stepIndex = steps.indexOf(step.id);
                      
                      const isPast = currentStepIndex > stepIndex;
                      const isCurrent = currentStepIndex === stepIndex;
                      
                      return (
                        <div key={step.id} className="flex items-center gap-3 text-sm font-mono text-xs">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                            isPast ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400" :
                            isCurrent ? "border-primary-500/50 text-primary-400 bg-primary-900/10" :
                            "border-slate-800 text-slate-600 bg-slate-900"
                          )}>
                            {isPast ? <CheckCircle2 className="w-3 h-3" /> : <div className={cn("w-1.5 h-1.5 rounded-full", isCurrent ? "bg-primary-500 shadow-[0_0_5px_rgba(208,150,59,0.8)]" : "bg-transparent")} />}
                          </div>
                          <span className={cn(
                            isPast ? "text-slate-400" :
                            isCurrent ? "text-primary-400" :
                            "text-slate-600"
                          )}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : transcriptionState.step === 'error' ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 p-6 text-center">
                  <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                  <h4 className="text-lg font-medium text-red-400 mb-2 font-serif">Transcription Failed</h4>
                  <p className="text-sm text-red-400/80 font-mono">{transcriptionState.error}</p>
                </div>
              ) : isEditingTranscript ? (
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="w-full h-full min-h-[300px] p-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar"
                  placeholder="Edit transcript here..."
                />
              ) : (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-slate-200 prose-headings:font-serif prose-a:text-primary-400 prose-strong:text-slate-200 prose-blockquote:border-primary-500/50 prose-blockquote:bg-primary-900/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:text-primary-300 prose-code:bg-primary-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none text-slate-300 font-sans">
                  <ReactMarkdown>{transcript}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="absolute inset-0 flex flex-col bg-grid-pattern">
              <div className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={cn(
                      "flex max-w-[85%]",
                      msg.role === 'user' ? "ml-auto" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-primary-900/30 border border-primary-800/50 text-primary-100 rounded-tr-sm" 
                        : "bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-tl-sm prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-slate-200 prose-strong:text-slate-200"
                    )}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex max-w-[85%] mr-auto"
                  >
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 rounded-tl-sm flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                      <span className="text-sm font-mono">Analyzing...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50 transition-all shadow-inner">
                  <div className="pl-4 pr-2 text-primary-500 font-mono font-bold select-none">
                    &gt;_
                  </div>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Query AI Analysis Engine..."
                    className="w-full bg-transparent text-slate-200 py-4 pr-14 text-sm focus:outline-none placeholder:text-slate-600 font-mono"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAnalyzing}
                    className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary-900/30 text-primary-400 rounded-xl hover:bg-primary-800/50 disabled:opacity-50 disabled:hover:bg-primary-900/30 transition-colors focus-ring"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
