import React from 'react';

export function TypographyBlock() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-primary">Типографика</h3>
        <p className="text-sm text-subtle">Иерархия текста. Используется чистый гротеск (sans-serif) без засечек.</p>
      </div>
      
      <div className="p-8 border border-border rounded-3xl bg-surface-hover flex flex-col gap-8 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Display 1 / 48px / Bold</span>
          <h1 className="text-5xl font-bold text-primary tracking-tight">Создаем будущее</h1>
        </div>
        
        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Heading 1 / 36px / Bold</span>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Анализ сессии</h1>
        </div>

        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Heading 2 / 24px / Bold</span>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Основные инсайты</h2>
        </div>

        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Heading 3 / 20px / Semibold</span>
          <h3 className="text-xl font-semibold text-primary">Настройки профиля</h3>
        </div>

        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Body Large / 18px / Regular</span>
          <p className="text-lg text-secondary leading-relaxed">Платформа предоставляет глубокий анализ эмоционального состояния на основе голосовых паттернов.</p>
        </div>

        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Body Default / 16px / Regular</span>
          <p className="text-base text-secondary leading-relaxed">Используйте этот текст для основных блоков контента, описаний и длинных абзацев. Он легко читается и не утомляет глаза.</p>
        </div>

        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Body Small / 14px / Medium</span>
          <p className="text-sm font-medium text-muted">Дополнительная информация, подписи к полям ввода и второстепенные элементы интерфейса.</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Caption / 12px / Medium</span>
          <p className="text-xs font-medium text-subtle">Мелкий текст для метаданных, дат и статусов.</p>
        </div>
      </div>
    </div>
  );
}
