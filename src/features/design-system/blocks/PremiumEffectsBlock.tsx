import React from 'react';
import { User, Calendar, LayoutGrid, TrendingUp, Tag, Plus } from 'lucide-react';

export function PremiumEffectsBlock() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-primary tracking-tight">Премиальные эффекты (Premium Effects)</h3>
        <p className="text-secondary leading-relaxed max-w-3xl">
          Система визуальных эффектов, создающая ощущение глубины, качества и "дороговизны" интерфейса. 
          Основана на сочетании мягких теней, микро-градиентов и многослойности.
        </p>
      </div>
      
      <div className="p-10 border border-border rounded-[3rem] bg-surface-hover flex flex-col gap-16 shadow-inner">
        
        {/* 1. Gradients & Glows */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h4 className="text-sm font-bold text-secondary uppercase tracking-widest">Градиенты и Свечение</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <button className="px-8 py-4 bg-premium-gradient rounded-2xl text-sm font-black text-background shadow-[0_10px_20px_-5px_rgba(67,97,238,0.4)] border-t border-white/30 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  New Session
                </button>
                <div className="absolute -inset-1 bg-accent/20 blur-xl rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-accent">.bg-premium-gradient</span>
                <p className="text-[11px] text-subtle">Используется для главных CTA. Обязательно наличие светлой верхней границы (border-t) для объема.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-hover border border-border/50 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent"></div>
                  <User className="w-6 h-6 text-accent" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-surface shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-accent">Status Glow</span>
                  <p className="text-[11px] text-subtle">Свечение индикаторов статуса подчеркивает их важность и состояние системы.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Card Compositions (The "Island" Principle) */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h4 className="text-sm font-bold text-secondary uppercase tracking-widest">Композиция карточек (Принцип Островов)</h4>
          </div>

          <div className="p-12 bg-background rounded-[4rem] border border-border/10 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-6 left-8 text-[10px] font-mono text-subtle/30 uppercase tracking-[0.3em]">Environment: bg-background</div>
            
            {/* Header Card Example */}
            <div className="bg-surface p-8 rounded-[2.5rem] border border-border/30 shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[2.5rem]"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-surface-hover border border-border/50 flex items-center justify-center shadow-inner">
                    <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_20px_rgba(67,97,238,0.6)]"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h5 className="text-3xl font-black text-primary tracking-tighter">саня</h5>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-subtle">
                        <Calendar className="w-4 h-4" />
                        Added Mar 31, 2026
                      </div>
                      <div className="flex items-center gap-2 text-sm text-subtle">
                        <LayoutGrid className="w-4 h-4" />
                        0 Sessions
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-black text-subtle uppercase tracking-[0.2em]">Status</span>
                  <div className="px-8 py-2.5 bg-success/5 border border-success/20 rounded-full shadow-inner">
                    <span className="text-xs font-black text-success-muted uppercase tracking-[0.2em]">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progress Card */}
              <div className="lg:col-span-2 bg-surface p-8 rounded-[2.5rem] border border-border/30 shadow-xl relative">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-success-muted" />
                    <h6 className="text-lg font-bold text-primary tracking-tight">Therapy Progress</h6>
                  </div>
                  <div className="px-4 py-2 bg-surface-hover rounded-xl border border-border/40 text-[10px] font-bold text-subtle uppercase tracking-widest">
                    Last 6 Months
                  </div>
                </div>
                <div className="h-40 flex items-end gap-2 px-4">
                  {[40, 70, 45, 90, 65, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-surface-hover rounded-t-lg border-x border-t border-border/20 relative group overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-accent/20 border-t border-accent/40 transition-all duration-500" 
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Themes Card */}
              <div className="bg-surface p-8 rounded-[2.5rem] border border-border/30 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <Tag className="w-5 h-5 text-accent" />
                  <h6 className="text-lg font-bold text-primary tracking-tight">Key Themes</h6>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Anxiety', 'Work Stress', 'Family Dynamics', 'Self-Esteem', 'Sleep Issues'].map(theme => (
                    <div key={theme} className="px-5 py-2.5 bg-surface-hover rounded-2xl border border-border/40 text-xs font-bold text-secondary hover:text-primary hover:border-accent/40 transition-all cursor-default shadow-sm active:scale-95">
                      {theme}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Technical Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface rounded-3xl border border-border/40">
            <h5 className="text-xs font-black text-accent uppercase tracking-widest mb-4">Shadows</h5>
            <ul className="flex flex-col gap-3">
              <li className="flex flex-col">
                <span className="text-[10px] font-mono text-primary">--shadow-premium</span>
                <span className="text-[10px] text-subtle">Мягкая внешняя тень для карточек</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-mono text-primary">shadow-inner</span>
                <span className="text-[10px] text-subtle">Внутренняя тень для эффекта вдавленности</span>
              </li>
            </ul>
          </div>
          <div className="p-6 bg-surface rounded-3xl border border-border/40">
            <h5 className="text-xs font-black text-accent uppercase tracking-widest mb-4">Borders</h5>
            <ul className="flex flex-col gap-3">
              <li className="flex flex-col">
                <span className="text-[10px] font-mono text-primary">border-t-white/10</span>
                <span className="text-[10px] text-subtle">Верхний блик (Highlight)</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-mono text-primary">border-border/30</span>
                <span className="text-[10px] text-subtle">Стандартная тонкая граница</span>
              </li>
            </ul>
          </div>
          <div className="p-6 bg-surface rounded-3xl border border-border/40">
            <h5 className="text-xs font-black text-accent uppercase tracking-widest mb-4">Rounding</h5>
            <ul className="flex flex-col gap-3">
              <li className="flex flex-col">
                <span className="text-[10px] font-mono text-primary">rounded-[2.5rem]</span>
                <span className="text-[10px] text-subtle">Для основных карточек-островов</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-mono text-primary">rounded-[4rem]</span>
                <span className="text-[10px] text-subtle">Для внешних контейнеров окружения</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
