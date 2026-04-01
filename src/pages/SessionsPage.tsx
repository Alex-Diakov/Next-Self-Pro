import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { UploadView } from '../components/features/sessions/UploadView';
import { SessionView } from '../components/features/sessions/SessionView';
import { dbService, SessionRecord } from '../services/db.service';
import { Icon } from '../components/ui/Icon';
import { useSessionStore } from '../store/useSessionStore';
import { motion, AnimatePresence } from 'motion/react';
import { safeFormatDate } from '../lib/utils';

const SessionAnalysisWrapper = ({ onBack }: { onBack: () => void }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <SessionView 
      file={null} 
      sessionId={sessionId || null}
      onBack={onBack} 
    />
  );
};

export function SessionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId: urlSessionId } = useParams<{ sessionId?: string }>();
  
  const [sessionFile, setSessionFile] = useState<File | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const clearSession = useSessionStore(state => state.clearSession);

  const loadSessions = async () => {
    const loadedSessions = await dbService.getAllSessions();
    setSessions(loadedSessions.sort((a, b) => b.date - a.date));
  };

  useEffect(() => {
    if (!sessionFile && !urlSessionId) {
      loadSessions();
    }
  }, [sessionFile, urlSessionId]);

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
    navigate('/sessions');
  };

  const handleSessionClick = (id: string) => {
    navigate(`/sessions/${id}`);
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

  const isSessionView = location.pathname.includes('/sessions/') || location.pathname.includes('/upload');

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={isSessionView ? 'Session Analysis' : 'Sessions Workspace'} 
        subtitle={isSessionView ? 'Reviewing and analyzing patient session' : 'Upload a new session or review past sessions'} 
      />
      <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
        <AnimatePresence>
          {sessionToDelete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-surface border border-border border-t-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-32 bg-error/5 blur-3xl pointer-events-none"></div>
                <h3 className="text-xl font-bold text-primary mb-2 relative z-10">Delete Session?</h3>
                <p className="text-muted mb-8 text-sm font-medium relative z-10">Are you sure you want to delete this session? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 relative z-10">
                  <button 
                    onClick={() => setSessionToDelete(null)}
                    className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-hover rounded-xl transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-5 py-2.5 text-sm font-bold text-primary bg-error-bg/80 hover:bg-error-bg border border-error-bg/50 border-t-white/10 rounded-xl transition-all shadow-lg shadow-error/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Routes>
          <Route index element={
            <div className="space-y-8 max-w-5xl mx-auto">
              <UploadView onUpload={(file) => {
                setSessionFile(file);
                navigate('/sessions/upload');
              }} />
              
              {sessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-primary mb-6 tracking-tight">Recent Sessions</h3>
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
                        onClick={() => handleSessionClick(session.id)}
                        className="card-premium p-6 cursor-pointer group focus-ring relative overflow-hidden"
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSessionClick(session.id);
                          }
                        }}
                      >
                        {/* Subtle hover gradient */}
                        <div className="absolute -inset-px bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border ${
                            session.status === 'completed' ? 'bg-success/10 text-success-muted border-success/20' : 
                            session.status === 'processing' ? 'bg-accent/10 text-accent-hover border-accent/20' : 
                            'bg-error/10 text-error-muted border-error/20'
                          }`}>
                            <Icon name="description" className="text-sm" />
                            {session.status === 'completed' ? 'Completed' : session.status === 'processing' ? 'Processing' : 'Error'}
                          </div>
                          <button 
                            onClick={(e) => handleDelete(e, session.id)}
                            className="text-subtle hover:text-error-muted opacity-0 group-hover:opacity-100 transition-opacity focus-ring rounded-xl p-1.5 hover:bg-error/10 flex items-center justify-center"
                            aria-label={`Delete session ${session.title}`}
                          >
                            <Icon name="delete" className="text-lg" />
                          </button>
                        </div>
                        <h4 className="font-bold text-primary mb-2 truncate text-lg relative z-10" title={session.title}>{session.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-subtle font-medium relative z-10">
                          <Icon name="schedule" className="text-lg" />
                          {safeFormatDate(session.date, 'MMM d, yyyy • h:mm a')}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>
          } />

          <Route path=":sessionId" element={
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <SessionAnalysisWrapper onBack={handleBack} />
            </motion.div>
          } />

          <Route path="upload" element={
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <SessionView 
                file={sessionFile} 
                sessionId={null}
                onBack={handleBack} 
              />
            </motion.div>
          } />
        </Routes>
      </div>
    </div>
  );
}
