import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useSessionStore } from '../store/useSessionStore';
import { dbService } from '../services/db.service';
import { Header } from '../components/layout/Header';
import { UploadView } from '../components/features/sessions/UploadView';
import { SessionView } from '../components/features/sessions/SessionView';
import { format } from 'date-fns';
import { Clock, FileText, Trash2, ArrowLeft, User, Calendar, Activity, FileVideo, Plus, X, Tag, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../lib/utils';

export function PatientProfilePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { activeProject, projectSessions, loadProject, loadProjectSessions, isLoading } = useProjectStore();
  const { clearSession } = useSessionStore();

  const [sessionFile, setSessionFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
    if (!sessionFile && !sessionId && projectId) {
      loadProjectSessions(projectId);
    }
  }, [sessionFile, sessionId, projectId, loadProjectSessions]);

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

  const handleBackToWorkspace = () => {
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

  if (isLoading && !activeProject) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Loading Patient..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Patient Not Found" />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <p>The patient you are looking for does not exist.</p>
          <button 
            onClick={() => navigate('/patients')}
            className="mt-4 text-primary-400 hover:text-primary-300"
          >
            Return to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={sessionFile || sessionId ? 'Session Analysis' : activeProject.name} 
        subtitle={sessionFile || sessionId ? 'Reviewing and analyzing patient session' : 'Patient Workspace'} 
        action={(!sessionFile && !sessionId) ? (
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-slate-900 px-5 py-2.5 rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(55,114,255,0.3)] hover:shadow-[0_0_30px_rgba(55,114,255,0.5)] focus-ring"
          >
            <Plus className="w-5 h-5" />
            New Session
          </button>
        ) : undefined}
      />
      
      <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
        <AnimatePresence>
          {isUploadModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 max-w-3xl w-full shadow-2xl relative"
              >
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-bold text-slate-100 mb-6 tracking-tight">Upload New Session</h3>
                <UploadView onUpload={(file) => {
                  setSessionFile(file);
                  setIsUploadModalOpen(false);
                }} />
              </motion.div>
            </motion.div>
          )}

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
            {/* Patient Header Info */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between bg-slate-900/60 border border-slate-800/60 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-primary-500 shadow-inner border border-white/5">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{activeProject.name}</h2>
                  <div className="flex items-center gap-5 mt-3 text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Added {safeFormatDate(activeProject.createdAt, 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {projectSessions.length} Sessions
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[200px] relative z-10">
                <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Status</div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold tracking-wide border text-center",
                  activeProject.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  activeProject.status === 'completed' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {activeProject.status ? activeProject.status.toUpperCase() : 'UNKNOWN'}
                </div>
              </div>
            </div>

            {/* Patient Dashboard Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress Chart Placeholder */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-[32px] p-8 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Therapy Progress
                  </h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800/50">Last 6 Months</span>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 relative z-10">
                  {/* Mock Chart Bars */}
                  {[40, 55, 45, 60, 75, 85].map((height, i) => (
                    <div key={i} className="w-full bg-slate-800/50 rounded-t-xl relative group-hover:bg-slate-800 transition-colors duration-300">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="absolute bottom-0 w-full bg-emerald-500/20 border-t-2 border-emerald-400 rounded-t-xl"
                      ></motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags / Key Themes */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-[32px] p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                <h3 className="text-xl font-bold text-slate-100 mb-6 tracking-tight flex items-center gap-2 relative z-10">
                  <Tag className="w-5 h-5 text-primary-400" />
                  Key Themes
                </h3>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {['Anxiety', 'Work Stress', 'Family Dynamics', 'Self-Esteem', 'Sleep Issues'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-950/50 border border-slate-800/80 rounded-full text-sm font-medium text-slate-300 hover:border-primary-500/30 hover:text-primary-300 transition-colors cursor-default">
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
                <h3 className="text-xl font-bold text-slate-100 mb-6 tracking-tight">Patient Sessions</h3>
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
                          <FileVideo className="w-3.5 h-3.5" />
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
              projectId={projectId}
              onBack={handleBackToWorkspace} 
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
