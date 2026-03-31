import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UploadView } from '../components/features/sessions/UploadView';
import { SessionView } from '../components/features/sessions/SessionView';
import { dbService, SessionRecord } from '../services/db.service';
import { format } from 'date-fns';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { motion, AnimatePresence } from 'motion/react';
import { safeFormatDate } from '../lib/utils';

export function SessionsPage() {
  const [sessionFile, setSessionFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const clearSession = useSessionStore(state => state.clearSession);

  const loadSessions = async () => {
    const loadedSessions = await dbService.getAllSessions();
    setSessions(loadedSessions.sort((a, b) => b.date - a.date));
  };

  useEffect(() => {
    if (!sessionFile && !sessionId) {
      loadSessions();
    }
  }, [sessionFile, sessionId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await dbService.deleteSession(sessionToDelete);
      setSessionToDelete(null);
      loadSessions();
    }
  };

  const handleBack = () => {
    clearSession();
    setSessionFile(null);
    setSessionId(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={sessionFile || sessionId ? 'Session Analysis' : 'Sessions Workspace'} 
        subtitle={sessionFile || sessionId ? 'Reviewing and analyzing patient session' : 'Upload a new session or review past sessions'} 
      />
      <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
        <AnimatePresence>
          {sessionToDelete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              >
                <h3 className="text-lg font-medium text-slate-100 mb-2">Delete Session?</h3>
                <p className="text-slate-400 mb-6 text-sm">Are you sure you want to delete this session? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setSessionToDelete(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors focus-ring"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-900/80 hover:bg-red-800 border border-red-800/50 rounded-lg transition-colors focus-ring"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {(!sessionFile && !sessionId) ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            <UploadView onUpload={setSessionFile} />
            
            {sessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-slate-100 mb-6 tracking-tight">Recent Sessions</h3>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {sessions.map(session => (
                    <motion.div 
                      key={session.id}
                      variants={itemVariants}
                      onClick={() => setSessionId(session.id)}
                      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-[24px] p-6 hover:border-slate-700 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] focus-ring relative overflow-hidden"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSessionId(session.id);
                        }
                      }}
                    >
                      {/* Subtle hover gradient */}
                      <div className="absolute -inset-px bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] pointer-events-none"></div>

                      <div className="flex justify-between items-start mb-5 relative z-10">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                          session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          session.status === 'processing' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                          {session.status === 'completed' ? 'Completed' : session.status === 'processing' ? 'Processing' : 'Error'}
                        </div>
                        <button 
                          onClick={(e) => handleDelete(e, session.id)}
                          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus-ring rounded-full p-1.5 hover:bg-red-500/10"
                          aria-label={`Delete session ${session.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-100 mb-2 truncate text-lg relative z-10" title={session.title}>{session.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium relative z-10">
                        <Clock className="w-4 h-4" />
                        {safeFormatDate(session.date, 'MMM d, yyyy • h:mm a')}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
          >
            <SessionView 
              file={sessionFile} 
              sessionId={sessionId}
              onBack={handleBack} 
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
