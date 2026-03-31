import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-24 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 sticky top-0 z-10 relative">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight text-glow">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        {action}
        <button className="px-5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-full text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300 shadow-sm focus-ring">
          Help & Resources
        </button>
      </div>
    </header>
  );
}
