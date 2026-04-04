import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useSessionStore } from '../store/session';
import { dbService } from '../services/db.service';
import { UploadView } from '../components/features/sessions/UploadView';
import { SessionView } from '../components/features/sessions/SessionView';
import { Icon } from '../components/ui/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../lib/utils';

const SessionAnalysisWrapper = ({ onBack, projectId }: { onBack: () => void, projectId?: string }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <SessionView 
      file={null} 
      sessionId={sessionId || null}
      projectId={projectId}
      onBack={onBack} 
    />
  );
};

export function PatientProfilePage() {
  const { projectId, sessionId: urlSessionId } = useParams<{ projectId: string, sessionId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeProject = useProjectStore(state => state.activeProject);
  const projectSessions = useProjectStore(state => state.projectSessions);
  const loadProject = useProjectStore(state => state.loadProject);
  const loadProjectSessions = useProjectStore(state => state.loadProjectSessions);
  const isLoading = useProjectStore(state => state.isLoading);
  
  const clearSession = useSessionStore(state => state.clearSession);

  const [sessionFile, setSessionFile] = useState<File | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      loadProjectSessions(projectId);
    }
  }, [projectId, loadProject, loadProjectSessions]);

  // If a session is completed/deleted, reload sessions
  useEffect(() => {
    // Only reload if we are on the main project page (no active session view)
    const isMainPage = location.pathname === `/patients/${projectId}` || location.pathname === `/patients/${projectId}/`;
    if (isMainPage && !sessionFile && !urlSessionId && projectId) {
      loadProjectSessions(projectId);
    }
  }, [sessionFile, urlSessionId, projectId, loadProjectSessions, location.pathname]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const confirmDelete = async () => {
    if (sessionToDelete && projectId) {
      await dbService.deleteSession(sessionToDelete);
      setSessionToDelete(null);
      loadProjectSessions(projectId);
    }
  };

  const handleBackToWorkspace = useCallback(() => {
    clearSession();
    setSessionFile(null);
    navigate(`/patients/${projectId}`);
  }, [clearSession, navigate, projectId]);

  const handleSessionClick = (id: string) => {
    navigate(`/patients/${projectId}/sessions/${id}`);
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

  if (isLoading && !activeProject) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-muted">
          <p>The patient you are looking for does not exist.</p>
          <button 
            onClick={() => navigate('/patients')}
            className="mt-4 text-accent-hover hover:text-accent-muted"
          >
            Return to Patients
          </button>
        </div>
      </div>
    );
  }

  const isSessionView = location.pathname.includes('/sessions/') || location.pathname.includes('/upload');

  return (
    <div className="flex flex-col h-full">
      {!isSessionView && (
        <div className="px-6 lg:px-8 pt-6 flex justify-end">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-background px-5 py-2.5 rounded-full font-bold transition-all duration-300 shadow-lg shadow-accent/30 hover:shadow-xl shadow-accent/50 focus-ring"
          >
            <Icon name="add" className="text-xl" />
            New Session
          </button>
        </div>
      )}
      
      <div className={cn("flex-1 relative", isSessionView ? "overflow-hidden" : "overflow-auto p-6 lg:p-8")}>
        <AnimatePresence>
          {isUploadModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 sm:p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-surface border border-border rounded-premium p-6 sm:p-8 max-w-3xl w-full shadow-premium relative max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-muted hover:text-secondary bg-surface-hover/50 hover:bg-surface-hover rounded-full transition-colors z-10 flex items-center justify-center"
                >
                  <Icon name="close" className="text-xl" />
                </button>
                <h3 className="text-2xl font-bold text-primary mb-6 tracking-tight pr-10">Upload New Session</h3>
                <UploadView onUpload={(file) => {
                  setSessionFile(file);
                  setIsUploadModalOpen(false);
                  navigate(`/patients/${projectId}/upload`);
                }} />
              </motion.div>
            </motion.div>
          )}

          {sessionToDelete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
              >
                <h3 className="text-lg font-medium text-primary mb-2">Delete Session?</h3>
                <p className="text-muted mb-6 text-sm">Are you sure you want to delete this session? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setSessionToDelete(null)}
                    className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-hover rounded-lg transition-colors focus-ring"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-primary bg-error-bg/80 hover:bg-error-bg border border-error-bg/50 rounded-lg transition-colors focus-ring"
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
              {/* Patient Header Info */}
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between card-premium p-8 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center text-accent shadow-inner border border-border-subtle">
                    <Icon name="person" filled className="text-4xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-primary tracking-tight">{activeProject.name}</h2>
                    <div className="flex items-center gap-5 mt-3 text-sm text-muted font-medium">
                      <span className="flex items-center gap-2">
                        <Icon name="calendar_today" className="text-lg" />
                        Added {safeFormatDate(activeProject.createdAt, 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="activity_zone" className="text-lg" />
                        {projectSessions.length} Sessions
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[200px] relative z-10">
                  <div className="text-sm text-subtle font-semibold uppercase tracking-wider">Status</div>
                  <div className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold tracking-wide border text-center",
                    activeProject.status === 'active' ? "bg-success/10 text-success-muted border-success/20" :
                    activeProject.status === 'completed' ? "bg-info/10 text-info-muted border-info/20" :
                    "bg-surface-hover text-muted border-border-hover"
                  )}>
                    {activeProject.status ? activeProject.status.toUpperCase() : 'UNKNOWN'}
                  </div>
                </div>
              </div>

              {/* Patient Dashboard Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Chart Placeholder */}
                <div className="lg:col-span-2 card-premium p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-[80px] pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
                      <Icon name="trending_up" className="text-xl text-success-muted" />
                      Therapy Progress
                    </h3>
                    <span className="text-sm font-medium text-subtle bg-background/50 px-3 py-1 rounded-full border border-border/50">Last 6 Months</span>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2 relative z-10">
                    {/* Mock Chart Bars */}
                    {[40, 55, 45, 60, 75, 85].map((height, i) => (
                      <div key={i} className="w-full bg-surface-hover/50 rounded-t-xl relative group-hover:bg-surface-hover transition-colors duration-300">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="absolute bottom-0 w-full bg-success/20 border-t-2 border-success-muted rounded-t-xl"
                        ></motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags / Key Themes */}
                <div className="card-premium p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[60px] pointer-events-none"></div>
                  <h3 className="text-xl font-bold text-primary mb-6 tracking-tight flex items-center gap-2 relative z-10">
                    <Icon name="sell" className="text-xl text-accent-hover" />
                    Key Themes
                  </h3>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {['Anxiety', 'Work Stress', 'Family Dynamics', 'Self-Esteem', 'Sleep Issues'].map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-background/50 border border-border/80 rounded-full text-sm font-medium text-secondary hover:border-accent/30 hover:text-accent-muted transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sessions List */}
              {projectSessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-primary mb-6 tracking-tight">Patient Sessions</h3>
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {projectSessions.map(session => (
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
                        <div className="absolute -inset-px bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-premium pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                            session.status === 'completed' ? 'bg-success/10 text-success-muted border-success/20' : 
                            session.status === 'processing' ? 'bg-accent/10 text-accent-hover border-accent/20' : 
                            'bg-error/10 text-error-muted border-error/20'
                          }`}>
                            <Icon name="video_file" className="text-sm" />
                            {session.status === 'completed' ? 'Completed' : session.status === 'processing' ? 'Processing' : 'Error'}
                          </div>
                          <button 
                            onClick={(e) => handleDelete(e, session.id)}
                            className="text-subtle hover:text-error-muted opacity-0 group-hover:opacity-100 transition-opacity focus-ring rounded-full p-1.5 hover:bg-error/10 flex items-center justify-center"
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
          
          <Route path="sessions/:sessionId" element={
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <SessionAnalysisWrapper onBack={handleBackToWorkspace} projectId={projectId} />
            </motion.div>
          } />

          {sessionFile && (
            <Route path="upload" element={
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full"
              >
                <SessionView 
                  file={sessionFile} 
                  sessionId={null}
                  projectId={projectId}
                  onBack={handleBackToWorkspace} 
                />
              </motion.div>
            } />
          )}
        </Routes>
      </div>
    </div>
  );
}
