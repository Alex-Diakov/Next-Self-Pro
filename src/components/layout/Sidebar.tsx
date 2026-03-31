import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Video, Settings, BrainCircuit, LogOut, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Video, label: 'Sessions', path: '/sessions' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: BrainCircuit, label: 'AI Insights', path: '/insights' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="w-72 lg:w-64 bg-slate-900/50 border-r border-slate-800/50 flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none backdrop-blur-xl">
      <div className="h-16 lg:h-24 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-primary-500">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-slate-100">NextSelf<span className="text-primary-500">Pro</span></span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-200 lg:hidden focus-ring rounded-full"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 py-6 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-4 px-5 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 focus-ring",
              isActive 
                ? "bg-primary-500 text-white shadow-[0_4px_20px_rgba(55,114,255,0.3)]" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 shrink-0">
        <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-full text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-300 focus-ring">
          <LogOut className="w-5 h-5 text-slate-500" />
          Sign Out
        </button>
        
        <div className="mt-6 flex items-center gap-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0 shadow-inner">
            DR
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-bold text-slate-100 truncate">Dr. Therapist</span>
            <span className="text-xs text-slate-500 font-medium truncate">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
