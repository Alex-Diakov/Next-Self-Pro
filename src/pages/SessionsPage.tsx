import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UploadView } from '../components/features/sessions/UploadView';
import { SessionView } from '../components/features/sessions/SessionView';
import { dbService, SessionRecord } from '../services/db.service';
import { format } from 'date-fns';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';

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

  return (
    <>
      <Header 
        title={sessionFile || sessionId ? 'Session Analysis' : 'Sessions Workspace'} 
        subtitle={sessionFile || sessionId ? 'Reviewing and analyzing patient session' : 'Upload a new session or review past sessions'} 
      />
      <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
        {sessionToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Session?</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this session? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {(!sessionFile && !sessionId) ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            <UploadView onUpload={setSessionFile} />
            
            {sessions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Sessions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map(session => (
                    <div 
                      key={session.id}
                      onClick={() => setSessionId(session.id)}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md text-xs font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          {session.status === 'completed' ? 'Completed' : session.status === 'processing' ? 'Processing' : 'Error'}
                        </div>
                        <button 
                          onClick={(e) => handleDelete(e, session.id)}
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1 truncate" title={session.title}>{session.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(session.date), 'MMM d, yyyy • h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <SessionView 
            file={sessionFile} 
            sessionId={sessionId}
            onBack={handleBack} 
          />
        )}
      </div>
    </>
  );
}
