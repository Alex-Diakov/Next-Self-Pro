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
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </button>
        
        <div className="bg-black rounded-3xl overflow-hidden shadow-lg aspect-video relative flex items-center justify-center">
          {videoUrl ? (
            isVideo ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                <audio src={videoUrl} controls className="w-3/4" />
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span className="text-sm">Loading media...</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Session Details</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">File Name</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">{session?.fileName || file?.name || 'Loading...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">File Size</span>
              <span className="font-medium text-slate-900">
                {session?.fileSize ? (session.fileSize / (1024 * 1024)).toFixed(2) : file ? (file.size / (1024 * 1024)).toFixed(2) : '0'} MB
              </span>
            </div>
            
            {/* Progress Indicator */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500">Status</span>
                <span className={cn(
                  "font-medium flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full",
                  transcriptionState.step === 'completed' ? "bg-emerald-50 text-emerald-700" :
                  transcriptionState.step === 'error' ? "bg-red-50 text-red-700" :
                  "bg-primary-50 text-primary-700"
                )}>
                  {transcriptionState.step === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {transcriptionState.step === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {transcriptionState.message}
                </span>
              </div>
              
              {isProcessing && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <motion.div 
                    className="bg-primary-500 h-1.5 rounded-full"
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
      <div className="w-full lg:w-7/12 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
        {/* Tabs */}
        <div className="flex items-center justify-between p-2 border-b border-slate-100 bg-slate-50/50">
          <div className="flex bg-slate-100/80 p-1 rounded-2xl w-full max-w-md">
            <button
              onClick={() => setActiveTab('transcript')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                activeTab === 'transcript' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <FileText className="w-4 h-4" />
              Transcription
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={isProcessing || transcriptionState.step === 'error'}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                activeTab === 'analysis' 
                  ? "bg-white text-primary-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI Analysis
            </button>
          </div>
          
          {activeTab === 'transcript' && transcriptionState.step === 'completed' && !isEditingTranscript && (
            <button 
              onClick={handleStartEdit}
              className="mr-2 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
          {activeTab === 'transcript' && isEditingTranscript && (
            <div className="flex items-center gap-2 mr-2">
              <button 
                onClick={() => setIsEditingTranscript(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={handleSaveTranscript}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors px-3 py-1.5 rounded-lg"
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
            <div className="absolute inset-0 overflow-auto p-6 lg:p-8">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6 max-w-sm mx-auto text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">Processing Session</h4>
                    <p className="text-sm text-slate-500">{transcriptionState.message}</p>
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
                        <div key={step.id} className="flex items-center gap-3 text-sm">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                            isPast ? "bg-emerald-500 border-emerald-500 text-white" :
                            isCurrent ? "border-primary-500 text-primary-500" :
                            "border-slate-200 text-slate-300"
                          )}>
                            {isPast ? <CheckCircle2 className="w-3 h-3" /> : <div className={cn("w-1.5 h-1.5 rounded-full", isCurrent ? "bg-primary-500" : "bg-transparent")} />}
                          </div>
                          <span className={cn(
                            isPast ? "text-slate-700" :
                            isCurrent ? "text-primary-700 font-medium" :
                            "text-slate-400"
                          )}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : transcriptionState.step === 'error' ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 p-6 text-center">
                  <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                  <h4 className="text-lg font-semibold text-red-700 mb-2">Transcription Failed</h4>
                  <p className="text-sm text-red-600/80">{transcriptionState.error}</p>
                </div>
              ) : isEditingTranscript ? (
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="w-full h-full min-h-[300px] p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none font-mono text-sm leading-relaxed"
                  placeholder="Edit transcript here..."
                />
              ) : (
                <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-800">
                  <ReactMarkdown>{transcript}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 overflow-auto p-6 space-y-6">
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
                        ? "bg-primary-600 text-white rounded-tr-sm" 
                        : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm prose prose-sm max-w-none prose-p:leading-relaxed"
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
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-sm flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about the session (e.g., 'Summarize the main conflicts')"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAnalyzing}
                    className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
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
