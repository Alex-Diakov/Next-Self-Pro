import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Routes, Route, useLocation } from 'react-router-dom';
import { UploadView } from '../components/features/sessions/UploadView';
import { SessionView } from '../components/features/sessions/SessionView';
import { dbService, SessionRecord } from '../services/db.service';
import { Icon } from '../components/ui/Icon';
import { useSessionStore } from '../store/session';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../lib/utils';
import { StatsCard } from '../components/features/sessions/components/StatsCard';
import { Project } from '../types';

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
  
  const sessionFile = useSessionStore(state => state.sessionFile as File | null);
  const setSessionFile = useSessionStore(state => state.setSessionFile);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'error'>('all');

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const clearSession = useSessionStore(state => state.clearSession);

  const loadData = useCallback(async () => {
    console.log('SessionsPage: Loading data from DB...');
    const [loadedSessions, loadedProjects] = await Promise.all([
      dbService.getAllSessions(),
      dbService.getAllProjects()
    ]);
    setSessions(loadedSessions.sort((a, b) => b.date - a.date));
    setProjects(loadedProjects);
  }, []);

  // Load data when on the main list
  useEffect(() => {
    if (location.pathname === '/sessions' || location.pathname === '/sessions/') {
      loadData();
    }
  }, [location.pathname, loadData]);

  // Clear stale sessionFile when on the list page
  useEffect(() => {
    if ((location.pathname === '/sessions' || location.pathname === '/sessions/') && sessionFile) {
      setSessionFile(null);
    }
  }, [location.pathname, sessionFile, setSessionFile]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await dbService.deleteSession(sessionToDelete);
      setSessionToDelete(null);
      loadData();
    }
  };

  const handleBack = useCallback(() => {
    clearSession();
    setSessionFile(null);
    navigate('/sessions');
    setTimeout(() => {
      loadData();
    }, 100);
  }, [clearSession, setSessionFile, navigate, loadData]);

  const handleSessionClick = (id: string) => {
    navigate(`/sessions/${id}`);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const processing = sessions.filter(s => s.status === 'processing').length;
    const totalSize = sessions.reduce((acc, s) => acc + (s.fileSize || 0), 0) / (1024 * 1024);
    
    return {
      total: sessions.length,
      completed,
      processing,
      totalSize: totalSize.toFixed(1)
    };
  }, [sessions]);

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
      <div className={cn("flex-1 relative", isSessionView ? "overflow-hidden" : "overflow-auto p-6 lg:p-10")}>
        <AnimatePresence>
          {sessionToDelete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-surface border border-border border-t-border-glass rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-32 bg-error/5 blur-3xl pointer-events-none"></div>
                <div className="w-16 h-16 rounded-2xl bg-error/10 text-error-muted border border-error/20 flex items-center justify-center mb-6 shadow-lg">
                  <Icon name="delete_forever" filled className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2 relative z-10 tracking-tight">Delete Session?</h3>
                <p className="text-muted mb-8 text-sm font-medium relative z-10 leading-relaxed">Are you sure you want to delete this session? All analysis and transcription data will be permanently removed.</p>
                <div className="flex justify-end gap-3 relative z-10">
                  <button 
                    onClick={() => setSessionToDelete(null)}
                    className="flex-1 px-5 py-3 text-sm font-bold text-secondary hover:bg-surface-hover rounded-xl transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-5 py-3 text-sm font-bold text-primary bg-error-bg/80 hover:bg-error-bg border border-error-bg/50 border-t-border-glass rounded-xl transition-all shadow-lg shadow-error/20"
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
            <div className="space-y-12 max-w-7xl mx-auto">
              {/* Header & Stats */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-bold text-primary mb-2 tracking-tight">Clinical Sessions</h2>
                    <p className="text-muted font-medium">Manage and analyze your therapeutic recordings with AI insights.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/sessions/upload')}
                    className="px-8 py-3.5 bg-premium-gradient border-t border-border-premium rounded-2xl text-sm font-bold text-background shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 glow-accent self-start md:self-auto"
                  >
                    <Icon name="add" className="text-xl" />
                    New Session
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard label="Total Sessions" value={stats.total} icon="folder_shared" color="info" delay={0.1} />
                  <StatsCard label="Completed" value={stats.completed} icon="check_circle" color="success" delay={0.2} trend={{ value: "+12%", isPositive: true }} />
                  <StatsCard label="Processing" value={stats.processing} icon="sync" color="accent" delay={0.3} />
                  <StatsCard label="Storage Used" value={`${stats.totalSize} MB`} icon="database" color="warning" delay={0.4} />
                </div>
              </div>

              {/* Filters & List */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-hover/50 p-2 rounded-2xl border border-border/40 backdrop-blur-md">
                  <div className="relative flex-1 w-full">
                    <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                    <input 
                      type="text" 
                      placeholder="Search sessions by title..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm focus:ring-0 placeholder:text-subtle text-secondary"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-1 bg-background/50 rounded-xl border border-border/40 w-full md:w-auto overflow-x-auto custom-scrollbar">
                    {(['all', 'completed', 'processing', 'error'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap",
                          statusFilter === status 
                            ? "bg-surface-highlight text-primary shadow-sm" 
                            : "text-subtle hover:text-secondary"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSessions.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredSessions.map(session => {
                      const project = projects.find(p => p.id === session.projectId);
                      const fileSizeMB = (session.fileSize / (1024 * 1024)).toFixed(1);
                      
                      return (
                        <motion.div 
                          key={session.id}
                          variants={itemVariants}
                          onClick={() => handleSessionClick(session.id)}
                          className="card-premium p-6 cursor-pointer group focus-ring flex flex-col h-full"
                          tabIndex={0}
                          role="button"
                        >
                          {/* Status Badge */}
                          <div className="flex justify-between items-start mb-6">
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border",
                              session.status === 'completed' ? 'bg-success/10 text-success-muted border-success/20' : 
                              session.status === 'processing' ? 'bg-accent/10 text-accent-hover border-accent/20' : 
                              'bg-error/10 text-error-muted border-error/20'
                            )}>
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                session.status === 'completed' ? 'bg-success' : 
                                session.status === 'processing' ? 'bg-accent animate-pulse' : 
                                'bg-error'
                              )} />
                              {session.status}
                            </div>
                            <button 
                              onClick={(e) => handleDelete(e, session.id)}
                              className="text-subtle hover:text-error-muted opacity-0 group-hover:opacity-100 transition-all focus-ring rounded-xl p-2 hover:bg-error/10 flex items-center justify-center"
                            >
                              <Icon name="delete" className="text-lg" />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="font-bold text-primary mb-2 text-xl tracking-tight group-hover:text-accent transition-colors line-clamp-2" title={session.title}>
                              {session.title}
                            </h4>
                            {project && (
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-surface-highlight flex items-center justify-center text-[10px] font-bold text-accent border border-border">
                                  {project.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-secondary/80">{project.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer Metadata */}
                          <div className="mt-6 pt-6 border-t border-border/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-xs text-subtle font-medium">
                                <Icon name="schedule" className="text-base" />
                                {safeFormatDate(session.date, 'MMM d')}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-subtle font-medium">
                                <Icon name="attachment" className="text-base" />
                                {fileSizeMB}MB
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-surface-highlight flex items-center justify-center text-subtle group-hover:bg-accent group-hover:text-background transition-all shadow-sm">
                              <Icon name="arrow_forward" className="text-lg" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 bg-surface-hover/30 rounded-[40px] border border-dashed border-border/60"
                  >
                    <div className="w-24 h-24 rounded-full bg-surface-highlight flex items-center justify-center mb-6 border border-border/40 shadow-inner">
                      <Icon name="search_off" className="text-4xl text-subtle" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2 tracking-tight">No sessions found</h3>
                    <p className="text-muted font-medium max-w-xs text-center">Try adjusting your search or filters, or upload a new clinical session.</p>
                    <button 
                      onClick={() => navigate('/sessions/upload')}
                      className="mt-8 px-8 py-3 bg-surface-highlight hover:bg-surface-highlight/80 rounded-xl text-sm font-bold text-secondary transition-all border border-border"
                    >
                      Upload New Session
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
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

          <Route path=":sessionId" element={
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <SessionAnalysisWrapper onBack={handleBack} />
            </motion.div>
          } />
        </Routes>
      </div>
    </div>
  );
}

