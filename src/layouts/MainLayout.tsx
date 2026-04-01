import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Icon } from '../components/ui/Icon';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

// Import pages
import { DashboardPage } from '../pages/DashboardPage';
import { SessionsPage } from '../pages/SessionsPage';
import { PatientsPage } from '../pages/PatientsPage';
import { PatientProfilePage } from '../pages/PatientProfilePage';

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="h-screen w-screen overflow-hidden flex flex-col p-4 lg:p-6 bg-background font-sans text-secondary relative">
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
            className="p-2 -ml-2 text-muted hover:text-secondary focus-ring rounded-xl lg:hidden flex items-center justify-center"
            aria-label="Open menu"
          >
            <Icon name="menu" className="text-2xl" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center gap-3 text-accent">
            <Icon name="psychology" filled className="text-3xl" />
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">NextSelf<span className="text-accent">Pro</span></span>
          </div>
          
          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center text-sm font-medium text-muted ml-8 border-l border-border pl-8">
            {getBreadcrumbs()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative group">
            <Icon name="search" className="text-lg text-subtle absolute left-3 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-surface border border-border border-t-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all w-64 placeholder:text-subtle text-secondary shadow-inner"
            />
          </div>
          
          {/* Notifications */}
          <button className="p-2.5 text-muted hover:text-secondary rounded-xl relative bg-surface border border-border border-t-white/10 shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center justify-center">
            <Icon name="notifications" className="text-xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full glow-accent"></span>
          </button>
          
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-surface-hover border border-border-hover border-t-white/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 shadow-xl overflow-hidden hover:ring-2 hover:ring-accent/30 transition-all cursor-pointer">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* App Window (Islands Container) */}
      <div className="flex-1 overflow-hidden flex flex-row gap-6 relative">
        {/* Sidebar Island */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shrink-0 flex flex-col h-full",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </aside>

        {/* Main Content Island */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-surface rounded-[32px] border border-border border-t-white/10 shadow-premium relative transition-all duration-300">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none"></div>
          
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
