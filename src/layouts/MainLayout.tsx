import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu, Search, Bell, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

// Import pages
import { DashboardPage } from '../pages/DashboardPage';
import { SessionsPage } from '../pages/SessionsPage';
import { PatientsPage } from '../pages/PatientsPage';
import { PatientProfilePage } from '../pages/PatientProfilePage';

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Generate breadcrumbs based on location
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return 'Dashboard';
    
    const crumbs = [];
    
    if (pathnames[0] === 'patients') {
      crumbs.push('Patients');
      if (pathnames[1]) {
        crumbs.push('Profile');
        if (pathnames[2] === 'sessions' && pathnames[3]) {
          crumbs.push('Analysis');
        } else if (pathnames[2] === 'upload') {
          crumbs.push('Upload');
        }
      }
    } else if (pathnames[0] === 'sessions') {
      crumbs.push('Sessions');
      if (pathnames[1] === 'upload') {
        crumbs.push('Upload');
      } else if (pathnames[1]) {
        crumbs.push('Analysis');
      }
    } else {
      crumbs.push(pathnames[0].charAt(0).toUpperCase() + pathnames[0].slice(1));
    }
    
    return crumbs.join(' > ');
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 lg:p-6 bg-background font-sans text-secondary overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Global Header */}
      <header className="flex justify-between items-center w-full mb-4 lg:mb-6 shrink-0 z-30 bg-transparent">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-muted hover:text-secondary focus-ring rounded-full lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center gap-3 text-accent">
            <BrainCircuit className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">NextSelf<span className="text-accent">Pro</span></span>
          </div>
          
          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center text-sm font-medium text-muted ml-8 border-l border-border pl-8">
            {getBreadcrumbs()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-subtle absolute left-3" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all w-64 placeholder:text-subtle text-secondary"
            />
          </div>
          
          {/* Notifications */}
          <button className="p-2 text-muted hover:text-secondary rounded-full relative bg-surface border border-border">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-surface-hover border border-border-hover flex items-center justify-center text-accent font-bold text-sm shrink-0 shadow-inner overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* App Window */}
      <div className="flex-1 overflow-hidden flex flex-row bg-surface rounded-3xl border border-border shadow-2xl shadow-background/40 relative">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 w-72 lg:w-64 flex flex-col h-full border-r border-border bg-surface/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} hideLogo />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname.split('/')[1] || 'dashboard'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              <Routes location={location}>
                <Route index element={<DashboardPage />} />
                <Route path="sessions/*" element={<SessionsPage />} />
                <Route path="patients" element={<PatientsPage />} />
                <Route path="patients/:projectId/*" element={<PatientProfilePage />} />
                <Route path="insights" element={<div className="p-8 text-muted font-mono">AI Insights Page (Coming Soon)</div>} />
                <Route path="settings" element={<div className="p-8 text-muted font-mono">Settings Page (Coming Soon)</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
