import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Video, Settings, BrainCircuit, X, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Video, label: 'Sessions', path: '/sessions' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: BrainCircuit, label: 'AI Insights', path: '/insights' },
];

interface SidebarProps {
  onClose?: () => void;
  hideLogo?: boolean;
}

export function Sidebar({ onClose, hideLogo }: SidebarProps) {
  return (
    <aside className="w-full h-full bg-surface flex flex-col shrink-0 rounded-[32px] border border-border border-t-white/10 overflow-y-auto custom-scrollbar shadow-2xl relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-accent/5 blur-3xl pointer-events-none"></div>
      
      {/* Логотип (Если нужен внутри сайдбара на мобилке) */}
      {!hideLogo && (
        <div className="h-[70px] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3 text-accent">
            <BrainCircuit className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-primary">NextSelf<span className="text-accent">Pro</span></span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-muted hover:text-secondary lg:hidden focus-ring rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      
      {/* Кнопка закрытия для мобилки, если логотип скрыт */}
      {hideLogo && onClose && (
        <div className="flex justify-end p-4 lg:hidden shrink-0">
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-secondary focus-ring rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* НАВИГАЦИЯ */}
      <nav className="py-6 px-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 focus-ring relative group",
              isActive 
                ? "bg-premium-gradient text-background shadow-lg shadow-accent/20 glow-accent border-t border-white/20" 
                : "text-muted hover:bg-surface-hover hover:text-secondary"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-background" : "text-subtle")} />
                {item.label}
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full blur-[2px]"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* НИЖНЯЯ ЧАСТЬ САЙДБАРА (Плашка, Settings) */}
      <div className="mt-auto p-6 shrink-0 flex flex-col gap-4">
        
        {/* ПЛАШКА: Upgrade to Pro */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-border border-t-white/10 flex flex-col gap-3 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-500"></div>
          
          <div className="flex items-center gap-2 text-accent">
            <Zap className="w-5 h-5 fill-accent/20 animate-pulse" />
            <span className="font-bold text-sm text-primary tracking-tight">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-subtle leading-relaxed font-medium">
            Unlock advanced AI insights and unlimited patient sessions.
          </p>
          <button className="w-full py-2.5 mt-1 bg-premium-gradient text-background rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20 border-t border-white/20">
            View Plans
          </button>
        </div>

        {/* Кнопка Settings */}
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
            "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 focus-ring relative group",
            isActive 
              ? "bg-premium-gradient text-background shadow-lg shadow-accent/20 glow-accent border-t border-white/20" 
              : "text-muted hover:bg-surface-hover hover:text-secondary"
          )}
        >
          {({ isActive }) => (
            <>
              <Settings className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-background" : "text-subtle")} />
              Settings
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full blur-[2px]"></div>
              )}
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

