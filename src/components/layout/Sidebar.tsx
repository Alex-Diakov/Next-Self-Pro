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
}

export function Sidebar({ onClose, hideLogo }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside className={cn(
      "h-full bg-surface flex flex-col shrink-0 rounded-[32px] border border-border border-t-white/10 overflow-y-auto custom-scrollbar shadow-2xl relative transition-all duration-300",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-accent/5 blur-3xl pointer-events-none"></div>
      
      {/* Логотип */}
      {!hideLogo && (
        <div className={cn("h-[70px] flex items-center px-8 shrink-0", isCollapsed ? "justify-center px-0" : "justify-between")}>
          <div className="flex items-center gap-3 text-accent">
            <Icon name="psychology" filled className="text-[40px]" />
            {!isCollapsed && <span className="text-xl font-bold tracking-tight text-primary">NextSelf<span className="text-accent">Pro</span></span>}
          </div>
          {!isCollapsed && onClose && (
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-muted hover:text-secondary lg:hidden focus-ring rounded-full flex items-center justify-center"
            >
              <Icon name="close" className="text-[40px]" />
            </button>
          )}
        </div>
      )}
      
      {/* НАВИГАЦИЯ */}
      <nav className={cn("py-6 px-6 space-y-2", isCollapsed ? "px-2" : "px-6")}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            title={isCollapsed ? item.label : ''}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 focus-ring relative overflow-hidden group",
              isCollapsed ? "justify-center px-0" : "px-5",
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
                {isActive && (
                  <>
                    <div className={cn("absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full blur-[1px] z-10 shadow-[0_0_8px_rgba(67,97,238,0.5)]", isCollapsed && "left-1/2 -translate-x-1/2")}></div>
                    {!isCollapsed && <div className="absolute right-[-16px] top-0 bottom-0 w-20 bg-accent blur-[20px] opacity-50 pointer-events-none z-0" />}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* НИЖНЯЯ ЧАСТЬ САЙДБАРА */}
      <div className="mt-auto p-6 shrink-0 flex flex-col gap-4">
        
        {/* ПЛАШКА: Upgrade to Pro */}
        <div className={cn("p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-border border-t-white/10 flex flex-col gap-3 shadow-xl relative overflow-hidden group", isCollapsed && "items-center p-3")}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-500"></div>
          
          <div className="flex items-center gap-2 text-accent">
            <Icon name="bolt" filled className={cn("text-[40px] animate-pulse", isCollapsed && "text-[32px]")} />
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
          title={isCollapsed ? "Settings" : ''}
          className={({ isActive }) => cn(
            "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 focus-ring relative overflow-hidden group",
            isCollapsed ? "justify-center px-0" : "px-5",
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
              {isActive && (
                <>
                  <div className={cn("absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full blur-[1px] z-10 shadow-[0_0_8px_rgba(67,97,238,0.5)]", isCollapsed && "left-1/2 -translate-x-1/2")}></div>
                  {!isCollapsed && <div className="absolute right-[-16px] top-0 bottom-0 w-20 bg-accent blur-[20px] opacity-50 pointer-events-none z-0" />}
                </>
              )}
            </>
          )}
        </NavLink>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-2 p-3 text-muted hover:text-secondary hover:bg-surface-hover rounded-xl transition-colors flex items-center justify-center"
        >
          <Icon name="menu_open" className={cn("text-[32px] transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}

