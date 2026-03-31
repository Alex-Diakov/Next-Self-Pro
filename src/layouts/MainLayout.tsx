import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu } from 'lucide-react';
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

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full lg:w-auto">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 border-b border-slate-800/50 flex items-center px-4 shrink-0 bg-slate-900/50 backdrop-blur-xl z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-200 focus-ring rounded-full"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 text-lg font-bold text-slate-100">NextSelf<span className="text-primary-500">Pro</span></div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <Routes location={location}>
              <Route index element={<DashboardPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/:projectId" element={<PatientProfilePage />} />
              <Route path="insights" element={<div className="p-8 text-slate-400 font-mono">AI Insights Page (Coming Soon)</div>} />
              <Route path="settings" element={<div className="p-8 text-slate-400 font-mono">Settings Page (Coming Soon)</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
