import React from 'react';

export function ButtonsBlock() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-primary">Кнопки (Buttons)</h3>
        <p className="text-sm text-subtle">4 состояния кнопок с плавными переходами (transition-colors).</p>
      </div>
      
      <div className="p-8 border border-border rounded-3xl bg-surface-hover flex flex-col gap-10 shadow-sm">
        
        {/* Primary Button */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Primary (Акцентная)</h4>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl transition-colors duration-300">
                Default
              </button>
              <span className="text-xs font-mono text-subtle">bg-accent</span>
            </div>
            
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-accent-hover text-white font-bold rounded-xl transition-colors duration-300">
                Hover
              </button>
              <span className="text-xs font-mono text-subtle">bg-accent-hover</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-accent-active text-white font-bold rounded-xl transition-colors duration-300 scale-95">
                Active
              </button>
              <span className="text-xs font-mono text-subtle">bg-accent-active</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button disabled className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl opacity-50 cursor-not-allowed">
                Disabled
              </button>
              <span className="text-xs font-mono text-subtle">opacity-50</span>
            </div>
          </div>
        </div>

        {/* Secondary Button */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Secondary (Второстепенная)</h4>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-surface-highlight text-primary font-semibold rounded-xl border border-border transition-colors duration-300">
                Default
              </button>
              <span className="text-xs font-mono text-subtle">bg-surface-highlight</span>
            </div>
            
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-border-hover text-primary font-semibold rounded-xl border border-border-hover transition-colors duration-300">
                Hover
              </button>
              <span className="text-xs font-mono text-subtle">hover:bg-border-hover</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-surface-hover text-primary font-semibold rounded-xl border border-border transition-colors duration-300 scale-95">
                Active
              </button>
              <span className="text-xs font-mono text-subtle">active:scale-95</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button disabled className="px-6 py-2.5 bg-surface-highlight text-primary font-semibold rounded-xl border border-border opacity-50 cursor-not-allowed">
                Disabled
              </button>
              <span className="text-xs font-mono text-subtle">opacity-50</span>
            </div>
          </div>
        </div>

        {/* Ghost Button */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Ghost (Прозрачная)</h4>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-transparent text-secondary font-semibold rounded-xl transition-colors duration-300">
                Default
              </button>
              <span className="text-xs font-mono text-subtle">bg-transparent</span>
            </div>
            
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-surface-hover text-primary font-semibold rounded-xl transition-colors duration-300">
                Hover
              </button>
              <span className="text-xs font-mono text-subtle">hover:bg-surface-hover</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-surface-highlight text-primary font-semibold rounded-xl transition-colors duration-300 scale-95">
                Active
              </button>
              <span className="text-xs font-mono text-subtle">active:scale-95</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button disabled className="px-6 py-2.5 bg-transparent text-secondary font-semibold rounded-xl opacity-50 cursor-not-allowed">
                Disabled
              </button>
              <span className="text-xs font-mono text-subtle">opacity-50</span>
            </div>
          </div>
        </div>

        {/* Danger Button */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Danger (Деструктивная)</h4>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-error/10 text-error-muted font-semibold rounded-xl border border-error/20 transition-colors duration-300">
                Default
              </button>
              <span className="text-xs font-mono text-subtle">bg-error/10</span>
            </div>
            
            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-error/20 text-error font-semibold rounded-xl border border-error/30 transition-colors duration-300">
                Hover
              </button>
              <span className="text-xs font-mono text-subtle">hover:bg-error/20</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button className="px-6 py-2.5 bg-error/30 text-error font-semibold rounded-xl border border-error/40 transition-colors duration-300 scale-95">
                Active
              </button>
              <span className="text-xs font-mono text-subtle">active:scale-95</span>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button disabled className="px-6 py-2.5 bg-error/10 text-error-muted font-semibold rounded-xl border border-error/20 opacity-50 cursor-not-allowed">
                Disabled
              </button>
              <span className="text-xs font-mono text-subtle">opacity-50</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
