import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Video, Settings, BrainCircuit, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Video, label: 'Sessions', path: '/sessions' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: BrainCircuit, label: 'AI Insights', path: '/insights' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3 text-primary-600">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-slate-900">NextSelf<span className="text-primary-600">Pro</span></span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-primary-50 text-primary-700" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-600" : "text-slate-400")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
          <LogOut className="w-5 h-5 text-slate-400" />
          Sign Out
        </button>
        
        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            DR
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-900">Dr. Therapist</span>
            <span className="text-xs text-slate-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
