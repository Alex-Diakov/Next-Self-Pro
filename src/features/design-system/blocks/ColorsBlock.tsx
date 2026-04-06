import React from 'react';

const ColorCard = ({ name, token, bgClass, borderClass = '', textClass = 'text-primary' }: { name: string, token: string, bgClass: string, borderClass?: string, textClass?: string }) => (
  <div className="flex flex-col gap-2">
    <div className={`h-20 rounded-2xl ${bgClass} ${borderClass} shadow-sm flex items-end p-3`}>
      <span className={`text-xs font-bold ${textClass}`}>{name}</span>
    </div>
    <span className="text-xs font-mono text-subtle">{token}</span>
  </div>
);

export function ColorsBlock() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-primary">Цветовая палитра и Слои</h3>
        <p className="text-sm text-subtle">Системные цвета, токены и правила наслоения (Layer Design).</p>
      </div>
      
      <div className="p-8 border border-border rounded-3xl bg-surface flex flex-col gap-12 shadow-sm">
        
        {/* Backgrounds & Surfaces */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Фоны и Поверхности (Backgrounds & Surfaces)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="Background" token="bg-background" bgClass="bg-background" borderClass="border border-border/50" />
            <ColorCard name="Surface" token="bg-surface" bgClass="bg-surface" borderClass="border border-border/50" />
            <ColorCard name="Surface Hover" token="bg-surface-hover" bgClass="bg-surface-hover" borderClass="border border-border/50" />
            <ColorCard name="Surface Highlight" token="bg-surface-highlight" bgClass="bg-surface-highlight" borderClass="border border-border/50" />
          </div>
        </div>

        {/* Accents */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Акценты (Accents)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="Accent Default" token="bg-accent" bgClass="bg-accent" textClass="text-white" />
            <ColorCard name="Accent Hover" token="bg-accent-hover" bgClass="bg-accent-hover" textClass="text-white" />
            <ColorCard name="Accent Active" token="bg-accent-active" bgClass="bg-accent-active" textClass="text-white" />
            <ColorCard name="Accent Glass" token="bg-accent/10" bgClass="bg-accent/10" borderClass="border border-accent/20" textClass="text-accent" />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Статусы (Status)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="Success" token="bg-success/10" bgClass="bg-success/10" borderClass="border border-success/20" textClass="text-success-muted" />
            <ColorCard name="Error" token="bg-error/10" bgClass="bg-error/10" borderClass="border border-error/20" textClass="text-error-muted" />
            <ColorCard name="Warning" token="bg-warning/10" bgClass="bg-warning/10" borderClass="border border-warning/20" textClass="text-warning-muted" />
            <ColorCard name="Info" token="bg-info/10" bgClass="bg-info/10" borderClass="border border-info/20" textClass="text-info-muted" />
          </div>
        </div>

        {/* Text Colors */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Текст (Text)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border border-border/50">
              <span className="text-lg font-bold text-primary">Primary</span>
              <span className="text-xs font-mono text-subtle">text-primary</span>
            </div>
            <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border border-border/50">
              <span className="text-lg font-bold text-secondary">Secondary</span>
              <span className="text-xs font-mono text-subtle">text-secondary</span>
            </div>
            <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border border-border/50">
              <span className="text-lg font-bold text-muted">Muted</span>
              <span className="text-xs font-mono text-subtle">text-muted</span>
            </div>
            <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border border-border/50">
              <span className="text-lg font-bold text-subtle">Subtle</span>
              <span className="text-xs font-mono text-subtle">text-subtle</span>
            </div>
          </div>
        </div>

        {/* Layering Example */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Правила наслоения (Layer Design)</h4>
          <p className="text-sm text-subtle mb-2">
            Принцип "Островов": Глубина создается за счет постепенного осветления слоев. 
            Основной фон — самый глубокий. Острова (контейнеры) выделяются на нем, а карточки внутри островов имеют максимальную яркость. 
            Вторичные элементы (теги, инпуты) могут использовать цвет нижнего слоя для создания эффекта "вдавленности" (Inset).
          </p>
          
          <div className="p-12 bg-background rounded-[3rem] border border-border/20 relative overflow-hidden">
            <span className="absolute top-4 left-6 text-[10px] font-mono text-subtle/50 uppercase tracking-widest">Layer 0: Background</span>
            
            <div className="mt-8 p-10 bg-surface rounded-[2.5rem] border border-border/40 relative shadow-2xl">
              <span className="absolute top-4 left-6 text-[10px] font-mono text-subtle/50 uppercase tracking-widest">Layer 1: Island (Surface)</span>
              
              <div className="mt-8 p-8 bg-surface-hover rounded-[2rem] border border-border/60 relative shadow-xl">
                <span className="absolute top-4 left-6 text-[10px] font-mono text-subtle/50 uppercase tracking-widest">Layer 2: Card (Surface Hover)</span>
                
                <div className="mt-8 flex gap-3">
                  <div className="px-4 py-2 bg-surface rounded-xl border border-border/40 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Layer 3: Inset Tag (bg-surface)
                  </div>
                  <div className="px-4 py-2 bg-surface-highlight rounded-xl border border-border/40 text-[10px] font-bold text-primary uppercase tracking-wider">
                    Layer 3: Highlight (bg-surface-highlight)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Object */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Пример реализации (Interface Object)</h4>
          <div className="p-12 bg-background rounded-[3rem] border border-border/10 flex justify-center">
            <div className="bg-surface p-8 rounded-[2.5rem] border border-border/30 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-hover border border-border/50 flex items-center justify-center shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(67,97,238,0.5)]"></div>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-primary tracking-tight">саня</h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-subtle flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-subtle"></div>
                        Added Mar 31, 2026
                      </span>
                      <span className="text-xs text-subtle flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-subtle"></div>
                        0 Sessions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-subtle uppercase tracking-widest">Status</span>
                  <div className="px-6 py-2 bg-success/5 border border-success/20 rounded-full">
                    <span className="text-[10px] font-black text-success-muted uppercase tracking-[0.2em]">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-hover p-6 rounded-[2rem] border border-border/40 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-accent rounded-full"></div>
                  <h6 className="text-xs font-bold text-secondary uppercase tracking-widest">Ключевые темы</h6>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Тревога', 'Стресс', 'Семья', 'Сон'].map(tag => (
                    <div key={tag} className="px-4 py-2 bg-surface rounded-xl border border-border/30 text-[11px] font-semibold text-subtle hover:text-secondary transition-colors cursor-default">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="w-full mt-8 py-4 bg-premium-gradient rounded-2xl text-sm font-black text-background shadow-[0_10px_20px_-5px_rgba(67,97,238,0.3)] border-t border-white/20 active:scale-[0.98] transition-all uppercase tracking-widest">
                + New Session
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
