import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';

const navItems = [
  { iconName: 'dashboard', label: 'Dashboard', path: '/' },
  { iconName: 'videocam', label: 'Sessions', path: '/sessions' },
  { iconName: 'group', label: 'Patients', path: '/patients' },
  { iconName: 'monitoring', label: 'AI Insights', path: '/insights' },
];

interface SidebarProps {
  onClose?: () => void;
  hideLogo?: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ onClose, hideLogo, isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <aside className={cn(
      "h-full bg-surface flex flex-col shrink-0 rounded-premium border border-border border-t-white/10 shadow-premium relative transition-[width] duration-300 ease-in-out overflow-visible",
      isCollapsed ? "w-24" : "w-72"
    )}>
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-accent/5 blur-3xl pointer-events-none"></div>
      
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute top-6 z-20 w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted hover:text-primary transition-all duration-300",
          isCollapsed ? "left-1/2 -translate-x-1/2" : "right-4"
        )}
      >
        <Icon name={isCollapsed ? "menu" : "menu_open"} className="text-2xl" />
      </button>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* НАВИГАЦИЯ */}
        <nav className={cn("pt-20 space-y-2", isCollapsed ? "px-2" : "px-6")}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl overflow-hidden text-sm font-semibold transition-all duration-300 focus-ring relative group",
              isCollapsed ? "justify-center px-0" : "",
              isActive 
                ? "bg-white/5 text-primary border-t border-white/10" 
                : "text-muted hover:bg-surface-hover hover:text-secondary"
            )}
          >
            {({ isActive }) => (
              <>
                <Icon 
                  name={item.iconName} 
                  filled={isActive} 
                  className={cn("text-[40px] transition-transform duration-300 group-hover:scale-110 relative z-10", isActive ? "text-primary" : "text-subtle")} 
                />
                {!isCollapsed && <span className="relative z-10">{item.label}</span>}
                
                {/* Кастомный тултип для свернутого вида */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-md text-xs font-semibold text-zinc-200 whitespace-nowrap shadow-xl shadow-black/50 z-50 pointer-events-none opacity-0 -translate-x-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                    {item.label}
                  </span>
                )}

                {isActive && (
                  <>
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full blur-[1px] z-10 shadow-[0_0_8px_rgba(67,97,238,0.5)]"></div>
                    <div className={cn(
                      "absolute top-0 bottom-0 z-0 pointer-events-none",
                      isCollapsed ? "right-0 w-1 blur-[6px] bg-accent/50" : "right-[-16px] w-20 bg-accent blur-[20px] opacity-50"
                    )} />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* НИЖНЯЯ ЧАСТЬ САЙДБАРА (Плашка, Settings) */}
      <div className={cn("mt-auto p-6 shrink-0 flex flex-col gap-4", isCollapsed ? "items-center" : "")}>
        
        {/* ПЛАШКА: Upgrade to Pro */}
        <div className={cn("rounded-2xl bg-gradient-to-br from-surface-hover to-surface border border-border border-t-white/10 shadow-xl relative overflow-hidden group", isCollapsed ? "p-3" : "p-5 flex flex-col gap-3")}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-500"></div>
          
          <div className={cn("flex items-center gap-2 text-accent", isCollapsed ? "justify-center" : "")}>
            <Icon name="bolt" filled className="text-[40px] animate-pulse" />
            {!isCollapsed && <span className="font-bold text-sm text-primary tracking-tight">Upgrade to Pro</span>}
          </div>
          {!isCollapsed && (
            <>
              <p className="text-xs text-subtle leading-relaxed font-medium">
                Unlock advanced AI insights and unlimited patient sessions.
              </p>
              <button className="w-full py-2.5 mt-1 bg-premium-gradient text-background rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20 border-t border-white/20">
                View Plans
              </button>
            </>
          )}
        </div>

        {/* Кнопка Settings */}
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
            "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl overflow-hidden text-sm font-semibold transition-all duration-300 focus-ring relative group",
            isCollapsed ? "justify-center px-0" : "",
            isActive 
              ? "bg-white/5 text-primary border-t border-white/10" 
              : "text-muted hover:bg-surface-hover hover:text-secondary"
          )}
        >
          {({ isActive }) => (
            <>
              <Icon 
                name="settings" 
                filled={isActive} 
                className={cn("text-[40px] transition-transform duration-300 group-hover:scale-110 relative z-10", isActive ? "text-primary" : "text-subtle")} 
              />
              {!isCollapsed && <span className="relative z-10">Settings</span>}
              
              {/* Кастомный тултип для свернутого вида */}
              {isCollapsed && (
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-md text-xs font-semibold text-zinc-200 whitespace-nowrap shadow-xl shadow-black/50 z-50 pointer-events-none opacity-0 -translate-x-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                  Settings
                </span>
              )}

              {isActive && (
                <>
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full blur-[1px] z-10 shadow-[0_0_8px_rgba(67,97,238,0.5)]"></div>
                  <div className={cn(
                    "absolute top-0 bottom-0 z-0 pointer-events-none",
                    isCollapsed ? "right-0 w-1 blur-[6px] bg-accent/50" : "right-[-16px] w-20 bg-accent blur-[20px] opacity-50"
                  )} />
                </>
              )}
            </>
          )}
        </NavLink>
      </div>
    </div>
    </aside>
  );
}

