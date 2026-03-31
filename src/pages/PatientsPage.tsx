import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { Users, Plus, Folder, Clock, Activity, X, User, ChevronRight } from 'lucide-react';
import { cn, safeFormatDate } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export function PatientsPage() {
  const { projects, isLoading, loadProjects, createProject } = useProjectStore();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreatePatient = () => {
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPatientName.trim()) {
      await createProject({
        name: newPatientName.trim(),
        description: '',
        status: 'active',
      });
      setIsModalOpen(false);
      setNewPatientName('');
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors focus-ring rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-semibold text-slate-100 mb-2">New Patient</h3>
              <p className="text-slate-400 mb-6 text-sm">Enter the name of the patient to create a new workspace.</p>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="patientName" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Patient Name
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    autoFocus
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors focus-ring"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newPatientName.trim()}
                    className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] focus-ring"
                  >
                    Create Patient
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-500" />
            Patients
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-sm">
            Manage your patient cases and therapy projects.
          </p>
        </div>
        
        <button 
          onClick={handleCreatePatient}
          className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(55,114,255,0.3)] hover:shadow-[0_6px_25px_rgba(55,114,255,0.4)] hover:-translate-y-0.5 focus-ring"
        >
          <Plus className="w-5 h-5" />
          New Patient
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-[24px] p-16 text-center flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/5">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3">No patients yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-10 text-sm leading-relaxed">
            Create your first patient case to start organizing sessions and AI insights.
          </p>
          <button 
            onClick={handleCreatePatient}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 border border-slate-700 focus-ring hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add First Patient
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => navigate(`/patients/${project.id}`)}
              className="bg-slate-900/60 border border-slate-800/60 rounded-[16px] p-4 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-300 group cursor-pointer shadow-md hover:shadow-xl backdrop-blur-xl flex items-center justify-between relative overflow-hidden"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute -inset-px bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-inner border border-white/5 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary-400 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 
                      Last updated: {safeFormatDate(project.updatedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="hidden md:flex gap-2">
                   {/* Mock Tags for demonstration */}
                   <span className="px-2.5 py-1 bg-slate-950/50 border border-slate-800/80 rounded-md text-xs font-medium text-slate-400">Anxiety</span>
                   <span className="px-2.5 py-1 bg-slate-950/50 border border-slate-800/80 rounded-md text-xs font-medium text-slate-400">Stress</span>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border uppercase hidden sm:block",
                  project.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  project.status === 'completed' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {project.status}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
