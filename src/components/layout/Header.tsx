import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 relative">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
      <div>
        <h1 className="text-xl font-medium text-slate-100 font-serif tracking-wide text-glow">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5 font-sans">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shadow-sm focus-ring">
          Help & Resources
        </button>
      </div>
    </header>
  );
}
