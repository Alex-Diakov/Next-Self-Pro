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
    <aside className="w-72 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none">
      <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 text-primary-500">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-slate-100 font-serif">NextSelf<span className="text-primary-500">Pro</span></span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-200 lg:hidden focus-ring rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-ring",
              isActive 
                ? "bg-slate-800 text-primary-400 shadow-sm border border-slate-700/50" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-500" : "text-slate-500")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200 focus-ring">
          <LogOut className="w-5 h-5 text-slate-500" />
          Sign Out
        </button>
        
        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
            DR
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-semibold text-slate-200 truncate">Dr. Therapist</span>
            <span className="text-xs text-primary-500/80 truncate">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
