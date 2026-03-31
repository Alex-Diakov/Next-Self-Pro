import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { FileText, Sparkles, Send, Loader2, ArrowLeft, PlayCircle, CheckCircle2, AlertCircle, Edit2, Save, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useSessionStore } from '../../../store/useSessionStore';

interface SessionViewProps {
  file: File | null;
  sessionId: string | null;
  projectId?: string;
  onBack: () => void;
}

type Tab = 'transcript' | 'analysis';

export function SessionView({ file, sessionId, projectId, onBack }: SessionViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('transcript');
  const [inputMessage, setInputMessage] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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
      processFile(file, projectId);
    }
  }, [sessionId, file, loadSession, processFile, projectId]);

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
  const isVideo = sessionFile?.type?.startsWith('video/') || session?.fileType?.startsWith('video/');

  const handleSeek = (timeString: string) => {
    // Parse MM:SS or HH:MM:SS
    const parts = timeString.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch(() => {});
    }
  };

  // Pre-process transcript to make timestamps clickable and format as chat
  const processTranscript = (text: string) => {
    if (!text) return '';
    
    // Convert timestamps like [00:00] or 00:00 to markdown links
    let processed = text.replace(/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/g, '[$1](#seek-$1)');
    
    // Add specific styling markers for Therapist/Client if they exist
    processed = processed.replace(/^(Therapist|Doctor|Interviewer|Speaker 1):\s*/gm, '> **Therapist:** ');
    processed = processed.replace(/^(Client|Patient|Interviewee|Speaker 2):\s*/gm, '> **Client:** ');
    
    return processed;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column: Media Player */}
      <div className="w-full lg:w-4/12 flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary-400 transition-colors w-fit bg-slate-900/40 px-4 py-2 rounded-full border border-slate-800/60 backdrop-blur-md hover:border-primary-500/30 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </button>
        
        <div className="bg-black rounded-[32px] overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center border border-slate-800/60 group">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {isProcessing && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[32px]">
              <div className="w-full h-full bg-primary-500/5 animate-scanline border-b border-primary-500/20 shadow-[0_4px_15px_rgba(139,92,246,0.1)]"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
            </div>
          )}
          {videoUrl ? (
            isVideo ? (
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <PlayCircle className="w-16 h-16 mb-4 opacity-30" />
                <audio ref={audioRef} src={videoUrl} controls className="w-3/4" />
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
              <span className="text-sm font-mono">Loading media...</span>
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-800/60 shadow-xl relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors focus-ring"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Info className="w-4 h-4 text-primary-400" />
              Session Details
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-bold flex items-center gap-1.5 text-[10px] uppercase px-2 py-1 rounded-full border tracking-wide",
                transcriptionState.step === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                transcriptionState.step === 'error' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                "bg-primary-500/10 text-primary-400 border-primary-500/20"
              )}>
                {transcriptionState.step === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                {transcriptionState.step === 'error' && <AlertCircle className="w-3 h-3" />}
                {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                {transcriptionState.step === 'completed' ? 'Ready' : isProcessing ? 'Processing' : 'Error'}
              </span>
              {isDetailsExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </button>

          <AnimatePresence>
            {isDetailsExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-4 text-sm border-t border-slate-800/30 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">File Name</span>
                    <span className="font-bold text-slate-200 truncate max-w-[180px] font-mono text-xs bg-slate-950/50 px-2 py-1 rounded-md border border-slate-800/50">{session?.fileName || file?.name || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">File Size</span>
                    <span className="font-bold text-slate-200 font-mono text-xs bg-slate-950/50 px-2 py-1 rounded-md border border-slate-800/50">
                      {session?.fileSize ? (session.fileSize / (1024 * 1024)).toFixed(2) : file ? (file.size / (1024 * 1024)).toFixed(2) : '0'} MB
                    </span>
                  </div>
                  
                  {isProcessing && (
                    <div className="pt-3 border-t border-slate-800/30">
                      <div className="flex justify-between items-center mb-2 text-xs">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="text-primary-400 font-mono">{transcriptionState.message}</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/50 shadow-inner">
                        <motion.div 
                          className="bg-primary-500 h-full rounded-full shadow-[0_0_10px_rgba(55,114,255,0.8)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${transcriptionState.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column: Workspace */}
      <div className="w-full lg:w-8/12 flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-[32px] border border-slate-800/60 shadow-2xl overflow-hidden h-[calc(100vh-8rem)] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none"></div>

        {/* Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-slate-950/40 relative z-10">
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl w-full max-w-md border border-slate-800/60 shadow-inner">
            <button
              onClick={() => setActiveTab('transcript')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 focus-ring",
                activeTab === 'transcript' 
                  ? "bg-slate-800 text-slate-100 shadow-md border border-slate-700" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
              )}
            >
              <FileText className="w-4 h-4" />
              Transcription
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={isProcessing || transcriptionState.step === 'error'}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 focus-ring",
                activeTab === 'analysis' 
                  ? "bg-primary-500/10 text-primary-400 shadow-md border border-primary-500/20" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex items-center gap-1.5 text-sm font-medium text-slate-900 bg-primary-500 hover:bg-primary-400 transition-colors px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] focus-ring"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative z-10">
          {activeTab === 'transcript' && (
            <div className="absolute inset-0 overflow-auto p-8 lg:p-10 custom-scrollbar">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-8 max-w-sm mx-auto text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-800/60 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-primary-500 rounded-full border-t-transparent animate-spin absolute inset-0 shadow-[0_0_20px_rgba(55,114,255,0.3)]"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">Processing Session</h4>
                    <p className="text-sm text-slate-400 font-mono bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800/50">{transcriptionState.message}</p>
                  </div>
                  
                  {/* Granular Progress Steps */}
                  <div className="w-full space-y-4 mt-6 text-left bg-slate-950/30 p-6 rounded-[24px] border border-slate-800/50">
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
                        <div key={step.id} className="flex items-center gap-4 text-sm font-mono text-xs">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
                            isPast ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            isCurrent ? "border-primary-500/50 text-primary-400 bg-primary-500/10 shadow-[0_0_10px_rgba(55,114,255,0.2)]" :
                            "border-slate-800 text-slate-600 bg-slate-900/50"
                          )}>
                            {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className={cn("w-2 h-2 rounded-full", isCurrent ? "bg-primary-500 shadow-[0_0_5px_rgba(55,114,255,0.8)]" : "bg-transparent")} />}
                          </div>
                          <span className={cn(
                            "font-medium transition-colors duration-300",
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
                <div className="h-full flex flex-col items-center justify-center text-red-500 p-8 text-center bg-red-500/5 rounded-[32px] border border-red-500/10">
                  <AlertCircle className="w-16 h-16 mb-6 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                  <h4 className="text-2xl font-bold text-red-400 mb-3 tracking-tight">Transcription Failed</h4>
                  <p className="text-sm text-red-400/80 font-mono bg-red-950/50 px-4 py-2 rounded-lg border border-red-900/50">{transcriptionState.error}</p>
                </div>
              ) : isEditingTranscript ? (
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="w-full h-full min-h-[300px] p-6 bg-slate-950/50 border border-slate-800/60 rounded-[24px] focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar shadow-inner"
                  placeholder="Edit transcript here..."
                />
              ) : (
                <div className="transcript-chat-container space-y-6 pb-10">
                  <ReactMarkdown 
                    components={{
                      a: ({ href, children }) => {
                        if (href?.startsWith('#seek-')) {
                          const time = href.replace('#seek-', '');
                          return (
                            <button 
                              onClick={() => handleSeek(time)}
                              className="inline-flex items-center justify-center px-2 py-0.5 mx-1 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 hover:text-primary-300 rounded text-xs font-mono border border-primary-500/30 transition-colors focus-ring"
                              title={`Jump to ${time}`}
                            >
                              <PlayCircle className="w-3 h-3 mr-1" />
                              {children}
                            </button>
                          );
                        }
                        return <a href={href}>{children}</a>;
                      },
                      blockquote: ({ children }) => {
                        // Extract text to determine speaker
                        const text = React.Children.toArray(children).join('');
                        const isTherapist = text.includes('**Therapist:**');
                        const isClient = text.includes('**Client:**');
                        
                        if (isTherapist || isClient) {
                          return (
                            <div className={cn(
                              "flex w-full mb-4",
                              isTherapist ? "justify-end" : "justify-start"
                            )}>
                              <div className={cn(
                                "max-w-[85%] p-4 rounded-[24px] text-sm leading-relaxed shadow-md",
                                isTherapist 
                                  ? "bg-primary-500/10 border border-primary-500/20 text-slate-200 rounded-tr-sm" 
                                  : "bg-slate-800/40 border border-slate-700/50 text-slate-300 rounded-tl-sm"
                              )}>
                                {children}
                              </div>
                            </div>
                          );
                        }
                        return <blockquote className="border-l-4 border-primary-500/50 bg-primary-500/5 py-2 px-6 rounded-r-2xl my-4 text-slate-300">{children}</blockquote>;
                      },
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }}
                  >
                    {processTranscript(transcript)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 overflow-auto p-8 space-y-8 custom-scrollbar">
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
                      "p-5 rounded-[24px] text-sm leading-relaxed shadow-lg",
                      msg.role === 'user' 
                        ? "bg-primary-500/20 border border-primary-500/30 text-primary-50 rounded-tr-sm backdrop-blur-md" 
                        : "bg-slate-800/40 border border-slate-700/50 text-slate-300 rounded-tl-sm backdrop-blur-md prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-slate-100 prose-headings:font-bold prose-strong:text-slate-100"
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
                    <div className="p-5 rounded-[24px] bg-slate-800/40 border border-slate-700/50 rounded-tl-sm flex items-center gap-3 text-slate-400 backdrop-blur-md shadow-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      <span className="text-sm font-mono font-medium">Analyzing...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-6 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
                <form onSubmit={handleSendMessage} className="relative flex items-center bg-slate-900/80 border border-slate-800/80 rounded-[24px] overflow-hidden focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50 transition-all shadow-inner">
                  <div className="pl-6 pr-3 text-primary-500 font-mono font-bold select-none text-lg">
                    &gt;_
                  </div>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Query AI Analysis Engine..."
                    className="w-full bg-transparent text-slate-200 py-5 pr-16 text-sm focus:outline-none placeholder:text-slate-600 font-mono font-medium"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAnalyzing}
                    className="absolute right-3 w-12 h-12 flex items-center justify-center bg-primary-500/20 text-primary-400 rounded-full hover:bg-primary-500/30 disabled:opacity-50 disabled:hover:bg-primary-500/20 transition-all duration-300 focus-ring shadow-sm"
                  >
                    <Send className="w-5 h-5 ml-1" />
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
