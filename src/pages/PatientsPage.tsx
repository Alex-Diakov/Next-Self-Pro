import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { Icon } from '../components/ui/Icon';
import { cn, safeFormatDate } from '../lib/utils';
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface border border-border border-t-border-glass rounded-premium p-8 max-w-md w-full shadow-premium relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-accent/5 blur-3xl pointer-events-none"></div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-subtle hover:text-secondary transition-colors focus-ring rounded-lg p-1 flex items-center justify-center"
              >
                <Icon name="close" className="text-xl" />
              </button>
              
              <h3 className="text-xl font-semibold text-primary mb-2">New Patient</h3>
              <p className="text-muted mb-6 text-sm">Enter the name of the patient to create a new workspace.</p>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="patientName" className="block text-sm font-medium text-secondary mb-1.5">
                    Patient Name
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    autoFocus
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-secondary placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-hover rounded-xl transition-colors focus-ring"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newPatientName.trim()}
                    className="px-6 py-2.5 text-sm font-bold text-background bg-premium-gradient hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-accent/20 border-t border-border-premium glow-accent"
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
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Icon name="group" filled className="text-4xl text-accent" />
            Patients
          </h1>
          <p className="text-muted mt-2 font-mono text-sm">
            Manage your patient cases and therapy projects.
          </p>
        </div>
        
        <button 
          onClick={handleCreatePatient}
          className="flex items-center justify-center gap-2 bg-premium-gradient text-background px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 border-t border-border-premium glow-accent"
        >
          <Icon name="add" className="text-xl" />
          New Patient
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card-premium p-16 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-surface-highlight rounded-full flex items-center justify-center mb-8 shadow-inner border border-border-subtle">
            <Icon name="group" className="text-5xl text-subtle" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">No patients yet</h3>
          <p className="text-muted max-w-md mx-auto mb-10 text-sm leading-relaxed">
            Create your first patient case to start organizing sessions and AI insights.
          </p>
          <button 
            onClick={handleCreatePatient}
            className="flex items-center gap-2 bg-surface-highlight hover:bg-border-hover text-secondary px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 border border-border-hover focus-ring hover:shadow-lg hover:-translate-y-0.5"
          >
            <Icon name="add" className="text-xl" />
            Add First Patient
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => navigate(`/patients/${project.id}`)}
              className="card-premium p-5 group cursor-pointer flex items-center justify-between relative overflow-hidden"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute -inset-px bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-surface-highlight rounded-full flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-colors duration-300 shadow-inner border border-border-subtle shrink-0">
                  <Icon name="person" filled className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary group-hover:text-accent-hover transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-subtle font-medium mt-1">
                    <span className="flex items-center gap-1.5">
                      <Icon name="schedule" className="text-lg" /> 
                      Last updated: {safeFormatDate(project.updatedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="hidden md:flex gap-2">
                   {/* Mock Tags for demonstration */}
                   <span className="px-3 py-1 bg-background/50 border border-border/80 rounded-lg text-xs font-medium text-muted">Anxiety</span>
                   <span className="px-3 py-1 bg-background/50 border border-border/80 rounded-lg text-xs font-medium text-muted">Stress</span>
                </div>
                <span className={cn(
                  "px-4 py-1.5 rounded-xl text-[11px] font-bold tracking-wide border uppercase hidden sm:block",
                  project.status === 'active' ? "bg-success/10 text-success-muted border-success/20" :
                  project.status === 'completed' ? "bg-info/10 text-info-muted border-info/20" :
                  "bg-surface-highlight text-muted border-border-hover"
                )}>
                  {project.status}
                </span>
                <Icon name="chevron_right" className="text-2xl text-subtle group-hover:text-accent-hover transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
