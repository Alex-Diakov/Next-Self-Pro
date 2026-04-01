import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-24 border-b border-border/50 bg-background/40 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 sticky top-0 z-10 relative border-t border-border-highlight">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight text-glow">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1 font-medium">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        {action}
        <button className="px-6 py-2.5 bg-surface/80 border border-border border-t-border-glass rounded-full text-sm font-bold text-secondary hover:bg-surface-hover hover:text-primary transition-all duration-300 shadow-lg focus-ring">
          Help & Resources
        </button>
      </div>
    </header>
  );
}
